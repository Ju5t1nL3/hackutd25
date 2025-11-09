import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- API Keys ---
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_NIM_URL = os.getenv("NVIDIA_NIM_URL")

# --- Validation ---
if not all([RETELL_API_KEY, SUPABASE_URL, SUPABASE_KEY, NVIDIA_API_KEY, NVIDIA_NIM_URL]):
    print("Error: One or more environment variables are missing.")
    print("Please check your .env file.")
    # In a real app, you might want to raise an exception
    # raise ValueError("Missing critical environment variables")