# /apps/searching-agent/main.py

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import httpx
from prisma import Prisma  # Import the client

app = FastAPI()

# --- Pydantic Models ---
# This defines the data your API will accept
class SearchRequest(BaseModel):
    query: str
    location: str
    max_price: float | None = None
    min_beds: int | None = None

# --- Background Task ---
# This is the actual long-running task
async def run_property_search(query: str, location: str):
    print(f"--- 🚀 Starting search for: {query} in {location} ---")
    
    # 1. TODO: Call NVIDIA Nemotron API (using httpx)
    # response = httpx.post("https://api.nvidia.com/nemotron/...", json={...})
    # print("Nemotron results:", response.json())
    # FAKE DATA for now:
    fake_property_address = f"123 Main St, {location}"
    fake_price = 500000

    # 2. TODO: Call Zillow/Google Maps (using httpx)
    # ...
    
    # 3. Connect to the database and save results
    db = Prisma()
    try:
        await db.connect()
        print("Database connected...")
        
        # This saves the data to the 'Property' table in your Supabase DB
        new_property = await db.property.create(
            data={
                'address': fake_property_address,
                'price': fake_price,
                'beds': 3, # Example data
                'baths': 2, # Example data
                'source': 'NemotronSearch'
            }
        )
        print(f"Successfully saved property: {new_property.address}")
        
    except Exception as e:
        print(f"Error saving to database: {e}")
    finally:
        if db.is_connected():
            await db.disconnect()
            print("Database disconnected.")
    
    print(f"--- ✅ Finished search for: {query} ---")


# --- API Endpoints ---
@app.post("/start-search")
async def start_search_endpoint(request: SearchRequest, background_tasks: BackgroundTasks):
    """
    Receives a search request from the dashboard,
    and immediately starts the search in the background.
    """
    print(f"Received job: {request.model_dump_json()}")

    # Run the task in the background so the API can respond immediately
    background_tasks.add_task(run_property_search, request.query, request.location)
    
    return {"status": "success", "message": "Search has started in the background."}

@app.get("/health")
def health_check():
    # A simple endpoint to make sure your server is running
    return {"status": "ok"}
