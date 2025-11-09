import asyncio
import agents  # Our prompts
from llm import nvidia_client  # Our new client
import json

async def run_test():
    """
    Tests the nvidia_client with a simple request.
    """
    print("--- Starting LLM test ---")
    
    # We will use the ROUTER_PROMPT for this test
    # It's the simplest prompt we have.
    system_prompt = agents.ROUTER_PROMPT
    user_prompt = "Hello, I'm interested in selling my house."

    print(f"System Prompt: {system_prompt}")
    print(f"User Prompt: {user_prompt}\n")
    print("Calling LLM... (this may take a moment)")

    try:
        # Call the client
        response_string = await nvidia_client.get_llm_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        
        print(f"\n--- SUCCESS ---")
        print(f"Raw LLM Output (string):\n{response_string}")
        
        # Try to parse the JSON string
        try:
            response_json = json.loads(response_string)
            print(f"\nParsed JSON object:\n{response_json}")
            
            # Assertions
            assert "intent" in response_json
            assert response_json["intent"] == "SELL"
            print("\nTest PASSED: JSON is valid and content is correct.")
            
        except json.JSONDecodeError:
            print("\nTest FAILED: The LLM output was not valid JSON.")
        
    except Exception as e:
        print(f"\n--- TEST FAILED ---")
        print(f"An error occurred: {e}")
    
    finally:
        # Always close the client when the script is done
        await nvidia_client.close_llm_client()

if __name__ == "__main__":
    # Make sure your .env file is filled out!
    asyncio.run(run_test())