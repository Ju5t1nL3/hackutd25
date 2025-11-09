from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use a relative import to get the services.py file
from . import schemas, services

app = FastAPI()

origins = [
    "http://localhost:3000", # The origin of your Next.js dashboard
    "http://localhost:3001", # In case it's on 3001
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # List of origins that are allowed
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# --- API Endpoints ---
@app.post("/generate-graph")
async def generate_graph_endpoint(request: schemas.GraphRequest):
    """
    Analyzes a set of criteria from a call log to find matching properties
    from our existing database.

    It uses an AI agent (Nemotron) to select the "best" match and provide
    a rationale, then returns a graph-compatible JSON object for
    visualization on the frontend.

    - **Input (Request Body):** A JSON object with the customer's
      criteria.
      {
        "location": "Richardson",
        "max_price": 500000,
        "min_beds": 3
      }

    - **Output (Response Body):** A JSON object containing the best match
      (with AI rationale) and the data to build a graph of all matches.
      {
        "bestMatch": {
          "id": "house_c",
          "address": "456 Oak St, Richardson",
          "rationale": "This is the best fit...",
          ...other_props
        },
        "graphData": {
          "nodes": [ ... ],
          "edges": [ ... ]
        }
      }
    """
    print(f"--- 🌐 MAIN: Received graph request: {request.model_dump_json()} ---")

    # This is NOT a background task. The user is waiting.
    # We await the result and return it directly.
    return await services.generate_opportunity_graph(request)


@app.get("/health")
def health_check():
    # A simple endpoint to make sure your server is running
    return {"status": "ok"}
