import requests
import json

tests = [
    "hi",
    "show me all doctors",
    "give me the doctor having experience of 2 years",
    "my kid has fever",
    "what services do you offer?",
    "i want experienced doctors",
]

for t in tests:
    try:
        r = requests.post("http://localhost:8000/chat", json={"message": t, "history": []}, timeout=30)
        d = r.json()
        resp = d["response"]
        status = d["status"]
        action = d.get("action")
        print(f"Q: {t}")
        print(f"A: {resp}")
        if action:
            label = action["label"]
            link = action["link"]
            print(f"   Button: [{label}]({link})")
        print(f"   Status: {status}")
        print("---")
    except Exception as e:
        print(f"Q: {t}")
        print(f"ERROR: {e}")
        print("---")
