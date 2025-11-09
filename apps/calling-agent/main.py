from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uvicorn

# We will import our config, but we don't use the keys just yet
import config 

# Initialize the FastAPI app
app = FastAPI()

# --- 1. Retell Webhook Endpoint ---
# This is where Retell sends conversation updates (e.g., "user said this")
# We use Request to log the raw body for now
@app.post("/retell-webhook")
async def handle_retell_webhook(request: Request):
    """
    Handles incoming webhook requests from Retell.
    This is the main endpoint for conversation turns.
    """
    try:
        # Get the JSON body from the request
        body = await request.json()
        
        # --- TEST ---
        # For now, just print what Retell sends us
        print("Received webhook data:")
        print(body)
        
        # --- TODO ---
        # Future logic will:
        # 1. Get call_id from body
        # 2. Check state in Supabase
        # 3. Route to an agent
        # 4. Call LLM
        # 5. Send response
        
        # --- Mock Response ---
        # For now, send a simple, static response to Retell
        # This tells Retell to say "Hello" and continue the call
        response = {
            "response_id": 1,
            "content": "Hello, this is the mock server response.",
            "content_complete": True,
            "end_call": False
        }
        return JSONResponse(content=response)

    except Exception as e:
        print(f"Error in webhook: {e}")
        return JSONResponse(
            status_code=500, 
            content={"message": "Internal Server Error"}
        )

# --- 2. Live Transcript WebSocket Endpoint ---
# This is where Retell streams live transcript fragments
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
            # Receive data from Retell
            data = await websocket.receive_text()
            
            # --- TEST ---
            # For now, just print the live transcript fragment
            print(f"[Transcript - {call_id}]: {data}")
            
            # --- TODO ---
            # Future logic will:
            # 1. Add this connection to a "manager"
            # 2. Broadcast the 'data' to all *other* #    WebSocket clients (like a dashboard)
            #    that are listening to this call_id.
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for call_id: {call_id}")
    except Exception as e:
        print(f"Error in WebSocket: {e}")
    finally:
        # --- TODO ---
        # Clean up the connection from the "manager"
        print(f"Closing WebSocket for {call_id}")   