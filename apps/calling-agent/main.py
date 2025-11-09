import uvicorn
import json
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# --- Core Imports ---
import config 
import agents
from llm import nvidia_client

# --- In-Memory State Manager ---
# This dictionary will hold the state of all active calls.
# It will be lost on server restart, which is fine for development.
# Format:
# {
#   "call_123": {
#       "active_intent": "SELL",
#       "history": [{"user": "...", "agent": "..."}],
#       "customer_data": {"property_address": "123 Main St"}
#   }
# }
conversation_state = {}


# --- FastAPI Lifecycle Events ---
# We use this to gracefully start up and shut down our LLM client.
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application's lifespan events.
    Called once on startup and once on shutdown.
    """
    # Startup:
    print("Application startup...")
    # (The httpx client in nvidia_client is already initialized)
    yield  # --- The application runs here ---
    # Shutdown:
    print("Application shutdown...")
    await nvidia_client.close_llm_client()
    print("LLM client closed.")

# Initialize the FastAPI app with the lifespan manager
app = FastAPI(lifespan=lifespan)


# --- 1. Retell Webhook Endpoint ---
@app.post("/retell-webhook")
async def handle_retell_webhook(request: Request):
    """
    Handles incoming webhook requests from Retell for conversation turns.
    """
    try:
        body = await request.json()
        call_id = body.get("call_id")
        transcript = body.get("transcript", "")
        
        if not call_id:
            raise HTTPException(status_code=400, detail="Missing call_id")
        
        # --- TEST ---
        # Log the incoming transcript
        print(f"\n[Webhook - {call_id}] Received transcript: {transcript}")

        # 1. Get or Initialize Call State
        if call_id not in conversation_state:
            conversation_state[call_id] = {
                "active_intent": None,
                "history": [],
                "customer_data": {}
            }
        
        state = conversation_state[call_id]
        
        # --- 2. Agent Routing Logic ---
        
        # If we don't know the intent, we must route first.
        if not state["active_intent"]:
            print(f"[Logic - {call_id}] No intent. Routing...")
            
            # Call the LLM with the Router prompt
            llm_response_str = await nvidia_client.get_llm_response(
                system_prompt=agents.ROUTER_PROMPT,
                user_prompt=transcript
            )
            
            # Parse the router's JSON response
            router_json = json.loads(llm_response_str)
            intent = router_json.get("intent")
            
            print(f"[Logic - {call_id}] Intent classified as: {intent}")
            
            if intent in ('BUY', 'SELL', 'RENT'):
                state["active_intent"] = intent
                # Rerun this same turn *with* the new intent
                # This makes the first response much faster
                return await process_turn(call_id, state, transcript)
            else:
                # Handle 'GENERAL' or unknown intents
                reply_text = "I see. To best help you, are you looking to buy, sell, or rent a property?"
                # We don't save history yet, as the "intent" isn't set
                return create_retell_response(reply_text)
        
        # If we *do* have an intent, process the turn normally
        else:
            return await process_turn(call_id, state, transcript)

    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse LLM JSON response. {e}")
        print(f"Raw response was: {llm_response_str}")
        return create_retell_response("I had a small glitch, could you please repeat that?")
    except Exception as e:
        print(f"Error in webhook: {e}")
        return create_retell_response("I'm sorry, I ran into an error. Could you say that again?")


async def process_turn(call_id: str, state: dict, transcript: str):
    """
    Core logic for handling a single conversation turn
    once an intent has been established.
    """
    print(f"[Logic - {call_id}] Processing turn with intent: {state['active_intent']}")

    # 1. Select the correct system prompt
    if state["active_intent"] == "SELL":
        system_prompt = agents.SELLER_PROMPT
    else: # BUY or RENT
        system_prompt = agents.ACQUISITION_PROMPT.format(
            intent=state["active_intent"].lower() # e.g., "buy" or "rent"
        )
        
    # 2. Call the LLM with history
    llm_response_str = await nvidia_client.get_llm_response(
        system_prompt=system_prompt,
        user_prompt=transcript,
        history=state["history"]
    )
    
    print(f"[LLM - {call_id}] Raw JSON response: {llm_response_str}")
    
    # 3. Parse the specialist agent's JSON response
    response_json = json.loads(llm_response_str)
    reply_text = response_json.get("reply_text", "I'm not sure what to say.")
    extracted_data = response_json.get("extracted_data", {})
    
    # 4. Update state
    if extracted_data:
        print(f"[State - {call_id}] Updating customer data: {extracted_data}")
        state["customer_data"].update(extracted_data)
        
    # Add this completed turn to history
    state["history"].append({"user": transcript, "agent": reply_text})
    
    print(f"[State - {call_id}] Current Data: {state['customer_data']}")
    
    # 5. Send the reply back to Retell
    return create_retell_response(reply_text)


def create_retell_response(content: str):
    """Helper function to format the response for Retell."""
    return JSONResponse(content={
        "response_id": 1,
        "content": content,
        "content_complete": True,
        "end_call": False
    })

# --- 2. Live Transcript WebSocket Endpoint ---
# (This logic is unchanged from our first step, but included for completeness)
@app.websocket("/ws-transcript/{call_id}")
async def websocket_transcript_endpoint(websocket: WebSocket, call_id: str):
    """
    Handles live transcript streaming from Retell via WebSocket.
    It will then broadcast these transcripts to any connected frontends.
    """
    await websocket.accept()
    print(f"WebSocket connection established for call_id: {call_id}")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[Transcript - {call_id}]: {data}")
            # TODO: Add broadcast logic to send data to a web dashboard
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for call_id: {call_id}")
    except Exception as e:
        print(f"Error in WebSocket: {e}")
    finally:
        print(f"Closing WebSocket for {call_id}")

# --- Main execution ---
if __name__ == "__main__":
    print("Starting server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)