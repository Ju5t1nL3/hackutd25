# Use a relative import to get the clients.py file
from . import clients

async def run_property_search(query: str, location: str):
    """
    The main business logic for a property search.
    1. Analyzes the query with Nemotron.
    2. Finds and saves properties (using fake data for now).
    """
    print(f"--- 🚀 SERVICE: Starting search for: {query} in {location} ---")
    
    # Step 1: Call Nemotron
    analysis = await clients.call_nemotron(query, location)
    
    if analysis:
        print("--- 🚀 SERVICE: Nemotron analysis complete. ---")
    
    # Step 2: Get and save property data
    await clients.save_fake_property_to_db(location)
    
    print(f"--- ✅ SERVICE: Finished search for: {query} ---")
