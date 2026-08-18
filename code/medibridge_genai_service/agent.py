from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from tools import TOOLS
import os

SYSTEM_PROMPT = """You are MediBridge Support Assistant.

Rules:
1. YOU MUST ALWAYS USE A TOOL FIRST to fetch real data for the user. Never guess or skip tools.
2. Respond in plain text. Never output JSON.
3. Only AFTER you receive data from the tool, present it to the user.
4. After presenting doctor data, append exactly: [ACTION: Find a Doctor](/doctors)
5. After presenting specialty/symptom data, append exactly: [ACTION: View Services](/services)
6. If the user asks for contact information, NEVER make up phone numbers or emails. Simply say 'Please visit our Contact Us page for our details.' and append exactly: [ACTION: Contact Us](/contact)

Tools:
- get_doctors: lists doctors, can filter by experience/specialization/fee
- check_symptoms: recommends specialty from symptoms
- get_specialties: lists available services
"""

def get_agent():
    try:
        llm = init_chat_model(
            model="llama-3.1-8b-instant",
            model_provider="groq",
            api_key=os.getenv("GROQ_API_KEY")
        )
    except Exception as e:
        from langchain_groq import ChatGroq
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=os.getenv("GROQ_API_KEY")
        )

    agent = create_agent(
        model=llm,
        tools=TOOLS,
        system_prompt=SYSTEM_PROMPT
    )
    return agent
