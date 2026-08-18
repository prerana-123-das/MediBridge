"""
Comprehensive test for the MediBridge GenAI agent.
Tests multiple scenarios to make sure responses are correct and human-readable.
"""
import os
from agent import get_agent
from dotenv import load_dotenv

load_dotenv()

agent = get_agent()

test_cases = [
    "hi",
    "show me the list of available doctors",
    "give me the doctor having experience of 2 years",
    "i want experienced doctors",
    "my kid has fever",
    "I have chest pain and shortness of breath",
    "what services do you offer?",
]

for i, query in enumerate(test_cases, 1):
    print(f"\n{'='*60}")
    print(f"TEST {i}: {query}")
    print(f"{'='*60}")
    try:
        result = agent.invoke({
            "messages": [{"role": "user", "content": query}]
        })
        ai_text = result["messages"][-1].content
        print(f"RESPONSE:\n{ai_text}")
    except Exception as e:
        print(f"ERROR: {e}")
    print()
