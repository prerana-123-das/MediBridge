import os
import requests
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv()
API_BASE_URL = os.getenv("SPRING_BOOT_API_URL", "http://localhost:8081/api/v1")

# ---------------------------------------------------------------------------
# Symptom-to-Specialty mapping
# ---------------------------------------------------------------------------
SPECIALTY_SYMPTOMS = [
    {"specialty": "Cardiology", "reasons": ["Chest pain", "High blood pressure", "Hypertension", "Heart palpitations", "Shortness of breath", "High cholesterol", "Irregular heartbeat", "Arrhythmia", "Swelling in legs", "Swelling in feet", "Dizziness", "Fainting", "Heart murmur", "Heart failure", "Coronary artery disease"]},
    {"specialty": "Orthopedics", "reasons": ["Back pain", "Neck pain", "Knee pain", "Shoulder pain", "Hip pain", "Joint pain", "Arthritis", "Sports injuries", "Bone fracture", "Ligament injury", "Sprains and strains", "Osteoporosis", "Frozen shoulder", "Carpal tunnel syndrome", "Foot and ankle pain", "Difficulty walking"]},
    {"specialty": "Pediatrics", "reasons": ["Fever in children", "Cough and cold in children", "Vaccination", "Growth concerns", "Poor weight gain", "Skin rashes in children", "Ear infection in children", "Developmental delay", "Behavioral concerns", "Newborn check-up"]},
    {"specialty": "General Physician", "reasons": ["Fever", "Cold and cough", "Headache", "Body pain", "Fatigue", "Diabetes management", "Viral infection", "Stomach pain", "Acidity", "Gastritis", "Diarrhea", "Constipation", "Urinary tract infection", "Allergies", "Skin infections", "Weight management", "General weakness"]},
    {"specialty": "Neurology", "reasons": ["Frequent headaches", "Migraine", "Dizziness", "Vertigo", "Seizures", "Epilepsy", "Stroke evaluation", "Numbness", "Tingling in hands or feet", "Tremors", "Memory loss", "Muscle weakness", "Balance problems", "Facial paralysis", "Sleep disorders", "Nerve injury"]},
    {"specialty": "ENT", "reasons": ["Ear pain", "Hearing loss", "Ringing in ears", "Tinnitus", "Sinus infection", "Nasal congestion", "Nosebleeds", "Sore throat", "Tonsillitis", "Hoarseness", "Difficulty swallowing", "Snoring", "Allergic rhinitis", "Nasal polyps"]},
    {"specialty": "Ophthalmology", "reasons": ["Blurred vision", "Eye pain", "Red eyes", "Dry eyes", "Cataracts", "Glaucoma", "Vision changes", "Double vision", "Eye injury", "Eye infection", "Floaters or flashes"]},
    {"specialty": "Dermatology", "reasons": ["Acne", "Skin rash", "Eczema", "Psoriasis", "Fungal infection", "Hair loss", "Dandruff", "Skin allergies", "Pigmentation", "Vitiligo", "Warts", "Nail disorders", "Skin infection", "Excessive sweating"]},
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _extract_data(api_json):
    if isinstance(api_json, dict) and "data" in api_json:
        return api_json["data"]
    return api_json

def _doctor_line(doc):
    name = doc.get("fullName", "Unknown")
    spec = doc.get("specialization", "General")
    exp = doc.get("experienceYears", 0) or 0
    fee = doc.get("consultationFee", 0) or 0
    rating = doc.get("rating", 0) or 0
    return f"Dr. {name} - {spec}, {exp} years experience, Rs.{fee}, Rating: {rating}/5"

def _fetch_doctors():
    """Fetch all doctors from the backend API."""
    response = requests.get(f"{API_BASE_URL}/doctors", timeout=5)
    response.raise_for_status()
    return _extract_data(response.json())

# ---------------------------------------------------------------------------
# TOOLS
# ---------------------------------------------------------------------------

@tool
def list_all_doctors() -> str:
    """List all available doctors on MediBridge. Use when user says 'show doctors', 'list doctors', 'available doctors', etc."""
    try:
        doctors = _fetch_doctors()
        if not doctors:
            return "There are currently no doctors available on MediBridge."
        lines = [f"Here are all {len(doctors)} doctor(s) on MediBridge:"]
        for i, doc in enumerate(doctors, 1):
            lines.append(f"{i}. {_doctor_line(doc)}")
        return "\n".join(lines)
    except Exception as e:
        return f"Sorry, could not fetch doctors. Error: {e}"


@tool
def find_doctors_by_experience(min_years: int) -> str:
    """Find doctors with at least the given years of experience. Use when user asks for experienced doctors or doctors with X years."""
    try:
        doctors = _fetch_doctors()
        filtered = [d for d in doctors if (d.get("experienceYears", 0) or 0) >= min_years]
        if not filtered:
            return f"No doctors found with at least {min_years} years of experience."
        lines = [f"Found {len(filtered)} doctor(s) with {min_years}+ years experience:"]
        for i, doc in enumerate(filtered, 1):
            lines.append(f"{i}. {_doctor_line(doc)}")
        return "\n".join(lines)
    except Exception as e:
        return f"Sorry, could not fetch doctors. Error: {e}"


@tool
def find_doctors_by_specialization(specialization: str) -> str:
    """Find doctors by their specialization. Use when user asks for cardiologists, neurologists, etc."""
    try:
        doctors = _fetch_doctors()
        filtered = [d for d in doctors if specialization.lower() in (d.get("specialization", "") or "").lower()]
        if not filtered:
            return f"No doctors found with specialization: {specialization}."
        lines = [f"Found {len(filtered)} {specialization} doctor(s):"]
        for i, doc in enumerate(filtered, 1):
            lines.append(f"{i}. {_doctor_line(doc)}")
        return "\n".join(lines)
    except Exception as e:
        return f"Sorry, could not fetch doctors. Error: {e}"


@tool
def check_symptoms(symptoms: str) -> str:
    """Recommend a medical specialty based on user symptoms. Use when user describes health problems like fever, pain, cough, dizziness, etc."""
    text_lower = symptoms.lower()
    matches = []
    for item in SPECIALTY_SYMPTOMS:
        for reason in item["reasons"]:
            reason_lower = reason.lower()
            if reason_lower in text_lower:
                if item["specialty"] not in matches:
                    matches.append(item["specialty"])
                break
            for word in text_lower.split():
                if len(word) > 3 and word in reason_lower:
                    if item["specialty"] not in matches:
                        matches.append(item["specialty"])
                    break
    if matches:
        return f"Based on the symptoms ({symptoms}), I recommend seeing a specialist in: {', '.join(matches)}."
    else:
        return f"For the symptoms ({symptoms}), I recommend seeing a General Physician who can diagnose and refer you."


@tool
def get_specialties() -> str:
    """List medical specialties available on MediBridge. Use when user asks about services, treatments, or specialties."""
    try:
        response = requests.get(f"{API_BASE_URL}/doctors/specialties", timeout=5)
        response.raise_for_status()
        specialties = _extract_data(response.json())
        if not specialties:
            return "No specialties are currently listed."
        lines = ["Medical specialties available on MediBridge:"]
        for s in specialties:
            name = s.get("name", "Unknown")
            desc = s.get("description", "")
            count = s.get("doctors", 0)
            lines.append(f"- {name} ({desc}) - {count} doctor(s)")
        return "\n".join(lines)
    except Exception as e:
        return f"Sorry, could not fetch specialties. Error: {e}"


TOOLS = [list_all_doctors, find_doctors_by_experience, find_doctors_by_specialization, check_symptoms, get_specialties]
