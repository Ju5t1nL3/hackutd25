from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
# Use a relative import to get the services.py file
from . import services

app = FastAPI()

# --- Pydantic Models ---
class SearchRequest(BaseModel):
    query: str
    location: str
    max_price: float | None = None
    min_beds: int | None = None


# --- API Endpoints ---
@app.post("/start-search")
async def start_search_endpoint(request: SearchRequest, background_tasks: BackgroundTasks):
    """
    Receives a search request from the dashboard,
    and immediately passes it to the service layer to run in the background.
    """
    print(f"--- 🌐 MAIN: Received job: {request.model_dump_json()} ---")

    # Pass the work to the service layer
    background_tasks.add_task(
        services.run_property_search, 
        request.query, 
        request.location
    )
    
    return {"status": "success", "message": "Search has started in the background."}

@app.get("/health")
def health_check():
    # A simple endpoint to make sure your server is running
    return {"status": "ok"}
