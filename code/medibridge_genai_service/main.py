from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import re

from guardrails import validate_user_prompt
from agent import get_agent

app = FastAPI(title="MediBridge GenAI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Action(BaseModel):
    label: str
    link: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    status: str
    action: Optional[Action] = None

# Initialize agent once at startup
agent = get_agent()

def _parse_response(ai_text: str):
    """Parse AI text, extract action tags, clean up response."""
    action = None
    action_pattern = r'\[(?i:ACTION):\s*([^\]]+)\]\(([^)]+)\)'
    action_matches = list(re.finditer(action_pattern, ai_text, re.IGNORECASE))
    if action_matches:
        last_match = action_matches[-1]
        action = Action(label=last_match.group(1).strip(), link=last_match.group(2).strip())
        ai_text = re.sub(action_pattern, '', ai_text, flags=re.IGNORECASE).strip()

    # Clean up stray tags and excessive whitespace
    ai_text = re.sub(r'<[^>]+>', '', ai_text).strip()
    ai_text = re.sub(r'\n{3,}', '\n\n', ai_text).strip()

    return ai_text, action


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Step 1: Input Validation
        validate_user_prompt(request.message)

        # Step 2: Prepare Conversation History
        conversation = request.history.copy()
        conversation.append({"role": "user", "content": request.message})

        # Step 3: Invoke the Agent (with retry on tool_use_failed)
        try:
            result = agent.invoke({"messages": conversation})
            ai_text = result["messages"][-1].content
        except Exception as agent_err:
            err_str = str(agent_err)
            # If the LLM generated a malformed tool call, extract any useful text
            if "tool_use_failed" in err_str:
                failed_text = ""
                try:
                    # Extract the failed_generation text from the error if possible
                    import json as json_module
                    err_json_start = err_str.find('{')
                    err_json_end = err_str.rfind('}') + 1
                    if err_json_start >= 0 and err_json_end > err_json_start:
                        try:
                            err_data = json_module.loads(err_str[err_json_start:err_json_end].replace("'", '"'))
                            failed_text = err_data.get("error", {}).get("failed_generation", "")
                        except Exception:
                            pass
                except Exception:
                    pass

                # Clean up: remove all function XML tags and JSON args
                ai_text = re.sub(r'<function=[^>]*>\s*', '', failed_text)
                ai_text = re.sub(r'\[/function\]', '', ai_text)
                ai_text = re.sub(r'</function>', '', ai_text)
                ai_text = re.sub(r'<function=[^/]*/>', '', ai_text)  # self-closing
                ai_text = re.sub(r'\{[^}]*\}', '', ai_text)  # JSON args
                ai_text = ai_text.strip()

                if not ai_text:
                    try:
                        # The LLM tried to call a tool but failed. Call the tool directly.
                        msg_lower = request.message.lower()
                        from tools import list_all_doctors, find_doctors_by_experience, check_symptoms, get_specialties
                        
                        if any(w in msg_lower for w in ["doctor", "list", "available", "show"]):
                            # Check if they want filtered results
                            import re as re2
                            exp_match = re2.search(r'(\d+)\s*(?:year|yr)', msg_lower)
                            if exp_match:
                                ai_text = find_doctors_by_experience.invoke({"min_years": int(exp_match.group(1))})
                            else:
                                ai_text = list_all_doctors.invoke({})
                            ai_text += "\n[ACTION: Find a Doctor](/doctors)"
                        elif any(w in msg_lower for w in ["service", "specialt", "treatment"]):
                            ai_text = get_specialties.invoke({})
                            ai_text += "\n[ACTION: View Services](/services)"
                        elif any(w in msg_lower for w in ["fever", "pain", "cough", "headache", "dizzy", "sick", "ill", "hurt"]):
                            ai_text = check_symptoms.invoke({"symptoms": request.message})
                            ai_text += "\n[ACTION: View Services](/services)"
                        else:
                            ai_text = "I'm sorry, I had trouble processing that. Could you please try rephrasing your question?"
                    except Exception as fallback_err:
                        ai_text = f"I'm sorry, I had trouble processing that. (Error: {fallback_err})"
            else:
                raise agent_err

        # Step 4: Parse and clean up
        ai_text, action = _parse_response(ai_text)

        if not ai_text:
            # The LLM outputted an action but no text (or tool_use_failed wiped it).
            # We'll use our manual fallback to fill in the missing text.
            try:
                msg_lower = request.message.lower()
                from tools import list_all_doctors, find_doctors_by_experience, check_symptoms, get_specialties
                
                if any(w in msg_lower for w in ["doctor", "list", "available", "show"]):
                    import re as re2
                    exp_match = re2.search(r'(\d+)\s*(?:year|yr)', msg_lower)
                    if exp_match:
                        ai_text = find_doctors_by_experience.invoke({"min_years": int(exp_match.group(1))})
                    else:
                        ai_text = list_all_doctors.invoke({})
                    if not action:
                        action = Action(label="Find a Doctor", link="/doctors")
                elif any(w in msg_lower for w in ["service", "specialt", "treatment"]):
                    ai_text = get_specialties.invoke({})
                    if not action:
                        action = Action(label="View Services", link="/services")
                elif any(w in msg_lower for w in ["fever", "pain", "cough", "headache", "dizzy", "sick", "ill", "hurt"]):
                    ai_text = check_symptoms.invoke({"symptoms": request.message})
                    if not action:
                        action = Action(label="View Services", link="/services")
                else:
                    ai_text = "I found the information for you! Click the button below to continue."
            except Exception as e:
                ai_text = "I found the information for you! Click the button below to continue."

        return ChatResponse(response=ai_text, status="success", action=action)

    except ValueError as ve:
        return ChatResponse(response=str(ve), status="blocked")
    except Exception as e:
        print(f"Error during chat: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            response="I'm sorry, something went wrong. Please try again in a moment.",
            status="error"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
