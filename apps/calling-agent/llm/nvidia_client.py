import httpx
import config
from typing import List, Dict, Any, Optional

# --- Shared Asynchronous HTTP Client ---
# We create a single, reusable client instance for all requests.
# This is much more efficient than creating a new one for every call.
# It's configured with the necessary auth headers and a reasonable timeout.

# Prepare the headers for our NVIDIA API
headers = {
    "Authorization": f"Bearer {config.NVIDIA_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}

# Define the specific model we are using
NVIDIA_MODEL_NAME = "nvidia/llama-3.1-nemotron-nano-8b-v1"

# Initialize the async client
# We set a 30-second timeout for all operations (connect, read, write)
client = httpx.AsyncClient(headers=headers, timeout=30.0)


async def get_llm_response(
    system_prompt: str,
    user_prompt: str,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Calls the NVIDIA NIM API to get a chat completion.

    Args:
        system_prompt: The "system" role prompt (e.g., from agents.py).
        user_prompt: The "user" role prompt (the latest user transcript).
        history: (Optional) A list of previous turns, e.g., 
                 [{"user": "...", "agent": "..."}, ...]

    Returns:
        A string containing the model's text response.
        
    Raises:
        httpx.HTTPStatusError: If the API returns a non-200 status.
        Exception: For general processing errors (e.g., JSON parsing).
    """

    # 1. Construct the 'messages' payload
    messages = [
        {"role": "system", "content": "/no_think"},
        {"role": "system", "content": system_prompt}
    ]

    # 2. Add history, if it exists
    if history:
        for turn in history:
            messages.append({"role": "user", "content": turn.get("user", "")})
            messages.append({"role": "assistant", "content": turn.get("agent", "")})

    # 3. Add the latest user prompt
    messages.append({"role": "user", "content": user_prompt})
    
    # 4. Define the full request body
    # We are forcing the LLM to output JSON by using `response_format`.
    # This is a standard OpenAI-compatible feature that Nemotron supports.
    payload = {
        "model": NVIDIA_MODEL_NAME,
        "messages": messages,
        "temperature": 0.2,  # Low temp for more predictable JSON output
        "top_p": 0.7,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"} # Force JSON output!
    }

    try:
        # 5. Make the asynchronous API call
        response = await client.post(config.NVIDIA_NIM_URL, json=payload)

        # 6. Check for errors
        # This will raise an exception if the status is 4xx or 5xx
        response.raise_for_status()

        # 7. Parse the successful response
        data = response.json()
        
        # 8. Extract the text content from the response
        # The typical OpenAI format is data['choices'][0]['message']['content']
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        if not content:
            print("Warning: LLM response was empty or in an unexpected format.")
            print(f"Full API response: {data}")
        
        return content

    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e.request.url} - {e.response.status_code}")
        print(f"Response body: {e.response.text}")
        raise  # Re-raise the exception to be handled by main.py
    except Exception as e:
        print(f"An error occurred in get_llm_response: {e}")
        raise

# --- Function to gracefully shut down the client ---
# We'll call this from main.py when the server stops
async def close_llm_client():
    """
    Closes the shared httpx.AsyncClient.
    """
    print("Closing NVIDIA LLM client...")
    await client.aclose()