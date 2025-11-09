import os

import httpx
from prisma import Prisma

# --- Load API Keys ---
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"


async def call_nemotron(query: str, location: str):
    """
    Calls the NVIDIA Nemotron API to analyze the user's query.
    """
    if not NVIDIA_API_KEY:
        print("--- ⚠️ NVIDIA_API_KEY not set. Skipping Nemotron call. ---")
        return None

    print("--- 🤖 Calling Nemotron to analyze query... ---")
    headers = {"Authorization": f"Bearer {NVIDIA_API_KEY}"}
    payload = {
        "model": "nvidia/nvidia-nemotron-nano-9b-v2",
        "messages": [
            {
                "role": "system",
                "content": "You are a real estate query analyst. Re-format the user's request into a structured JSON object.",
            },
            {"role": "user", "content": f"Query: {query}, Location: {location}"},
        ],
        "max_tokens": 1024,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                NVIDIA_API_URL, headers=headers, json=payload, timeout=30
            )
            response.raise_for_status()  # Check for HTTP errors

            analysis = response.json()["choices"][0]["message"]["content"]
            print(f"--- 🤖 Nemotron Analysis: {analysis} ---")
            return analysis

    except Exception as e:
        print(f"--- ❌ NEMOTRON API ERROR: {e} ---")
        return None


async def save_fake_property_to_db(location: str):
    """
    Generates fake property data and saves it to the database.
    """
    print("--- 🏠 Generating fake property data... ---")

    # FAKE DATA for now:
    fake_property_address = f"123 Main St, {location}"
    fake_price = 500000

    db = Prisma()
    try:
        await db.connect()
        print("Database connected...")

        new_property = await db.property.create(
            data={
                "address": fake_property_address,
                "price": fake_price,
                "beds": 3,  # Example data
                "baths": 2,  # Example data
                "source": "FakeData_NemotronTest",
            }
        )
        print(f"Successfully saved property: {new_property.address}")

    except Exception as e:
        print(f"Error saving to database: {e}")
    finally:
        if db.is_connected():
            await db.disconnect()
            print("Database disconnected.")
