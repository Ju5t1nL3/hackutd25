import httpx
import config
from typing import List, Dict, Any, Optional
import json

# --- NVIDIA API Configuration ---
# We still define the headers and model name globally
headers = {
    "Authorization": f"Bearer {config.NVIDIA_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}
NVIDIA_MODEL_NAME = "nvidia/llama-3.1-nemotron-nano-8b-v1"


async def get_llm_response(
    system_prompt: str,
    user_prompt: str,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Calls the NVIDIA NIM API to get a chat completion.
    A new client is created for every call to prevent connection issues.
    """

    # This removes the invisible "non-breaking space" characters.
    system_prompt = system_prompt.replace("\xa0", " ")

    # 1. Construct the 'messages' payload
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for turn in history:
            messages.append({"role": "user", "content": turn.get("user", "")})
            messages.append({"role": "assistant", "content": turn.get("agent", "")})
    messages.append({"role": "user", "content": user_prompt})
    
    # 4. Define the full request body
    payload = {
        "model": NVIDIA_MODEL_NAME,
        "messages": messages,
        "temperature": 0.2,
        "top_p": 0.7,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"}
    }

    # --- NEW CLIENT LOGIC ---
    # We create a fresh client *inside* the function.
    # This is less efficient but much more robust for debugging.
    try:
        async with httpx.AsyncClient(headers=headers, timeout=120.0) as client:
            
            print(f"--- DEBUG: Calling NVIDIA with payload: {payload}")
            response = await client.post(config.NVIDIA_NIM_URL, json=payload)
            response.raise_for_status()

            data = response.json()
            print(f"--- DEBUG: Full API response: {data}")

            choices = data.get("choices")
            if not choices:
                print("Error: LLM response had no 'choices' list.")
                raise Exception("LLM response was valid but empty.")

            message = choices[0].get("message")
            if not message:
                print("Error: First choice had no 'message' object.")
                raise Exception("LLM response choice was empty.")

            content = message.get("content")
            if content is None:
                print("Error: Message object had no 'content'.")
                raise Exception("LLM message content was missing.")
            
            return content

    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e.request.url} - {e.response.status_code}")
        print(f"Response body: {e.response.text}")
        raise
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON from API response.")
        print(f"Response text: {response.text}")
        raise
    except httpx.ReadTimeout as e:
        print(f"ReadTimeout occurred. The server took too long to respond.")
        raise
    except Exception as e:
        print(f"An unexpected error occurred in get_llm_response: {type(e).__name__}: {e}")
        raise

async def close_llm_client():
    """
    Does nothing now, as we are not using a global client.
    """
    print("No global LLM client to close.")
    pass