import json
import os
import httpx
from . import property_data, schemas

# --- Load API Keys ---
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"


def _get_property_database():
    """
    Loads the list of all properties from our data source.
    """
    # This now looks like it's loading a real data module
    return property_data.HOUSES

async def extract_criteria_from_notes(notes: str) -> dict:
    """
    NEW: Uses Nemotron to parse unstructured notes into structured JSON.
    """
    print(f"--- 🤖 CLIENT: Parsing notes with Nemotron: {notes} ---")
    if not NVIDIA_API_KEY:
        print("--- ⚠️ NVIDIA_API_KEY not set. Using default criteria. ---")
        return {"location": "Richardson", "max_price": 500000, "min_beds": 3, "min_baths": 2}

    # 1. Define the output tool (our JSON schema)
    output_tool = {
        "type": "function",
        "function": {
            "name": "submit_criteria",
            "description": "Submit the extracted property criteria.",
            "parameters": schemas.PropertyCriteria.model_json_schema() # Generate schema from Pydantic
        }
    }

    system_prompt = "You are an expert at extracting structured data from unstructured text. The user will provide notes from a call. Extract the property criteria by calling the `submit_criteria` tool."
    user_prompt = f"Here are the call notes: {notes}"

    headers = {"Authorization": f"Bearer {NVIDIA_API_KEY}"}
    payload = {
        "model": "nvidia/nvidia-nemotron-nano-9b-v2",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "tools": [output_tool],
        "tool_choice": {"type": "function", "function": {"name": "submit_criteria"}}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(NVIDIA_API_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
        message = response.json()['choices'][0]['message']
        if message.get("tool_calls"):
            args_str = message['tool_calls'][0]['function']['arguments']
            print(f"--- 🤖 CLIENT: Extracted criteria: {args_str} ---")
            return json.loads(args_str)
        else:
            raise ValueError("Nemotron did not call the `submit_criteria` tool.")

    except Exception as e:
        print(f"--- ❌ NEMOTRON PARSE ERROR: {e} ---")
        # Fallback for the demo
        return {"location": "Richardson", "max_price": 500000, "min_beds": 3, "min_baths": 2}

async def score_properties(criteria: schemas.PropertyCriteria): # <-- Use new schema
    """
    Scores all properties against the extracted criteria.
    """
    print("--- 🛠️ CLIENT: Scoring all properties... ---")
    all_houses = _get_property_database()
    scored_houses = []

    for house in all_houses:
        score_details = {}
        score_details["isLocationMatch"] = house["location"].lower() == criteria.location.lower()
        score_details["isPriceMatch"] = criteria.max_price is None or house["price"] <= criteria.max_price
        score_details["isBedsMatch"] = criteria.min_beds is None or house["beds"] >= criteria.min_beds
        score_details["isBathsMatch"] = criteria.min_baths is None or house["baths"] >= criteria.min_baths # <-- ADDED BATHS
        
        # Calculate the total score (now out of 4)
        score_details["matchScore"] = sum([
            score_details["isLocationMatch"],
            score_details["isPriceMatch"],
            score_details["isBedsMatch"],
            score_details["isBathsMatch"] # <-- ADDED BATHS
        ])
        
        house_with_score = house.copy()
        house_with_score["score"] = score_details
        scored_houses.append(house_with_score)

    print(f"--- 🛠️ CLIENT: Scoring complete. ---")
    return scored_houses


async def get_ai_analysis(scored_matches: list, criteria: schemas.GraphRequest):
    """
    Asks Nemotron to analyze a list of SCORED matches and pick the best one.
    """
    if not NVIDIA_API_KEY:
        print("--- ⚠️ NVIDIA_API_KEY not set. Using default match. ---")
        # Find the best match based on score
        best_match = max(scored_matches, key=lambda h: h["score"]["matchScore"])
        return {
            "bestMatchID": best_match["id"],
            "rationale": "AI offline. Defaulting to highest-scoring match.",
        }

    print(
        f"--- 🤖 CLIENT: Sending {len(scored_matches)} scored properties to Nemotron... ---"
    )

    # Define the output tool
    output_tool = {
        "type": "function",
        "function": {
            "name": "submit_analysis",
            "description": "Submit the final analysis of the best property match.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bestMatchID": {
                        "type": "string",
                        "description": "The 'id' of the best matching house.",
                    },
                    "rationale": {
                        "type": "string",
                        "description": "A 1-sentence rationale for the broker.",
                    },
                },
                "required": ["bestMatchID", "rationale"],
            },
        },
    }

    # Create the prompts
    system_prompt = """
    You are a real estate analyst. A user will provide criteria and a list of all
    properties, each with a 'score' object showing which criteria matched.
    Your job is to analyze this list and select the single best option.
    Prioritize perfect (3/3) matches, but if none exist, pick the best
    partial match (2/3) and explain your choice.
    Submit your finding by calling the `submit_analysis` tool.
    """

    user_prompt = f"""
    Criteria: {json.dumps(criteria.model_dump())}
    Scored Properties: {json.dumps(scored_matches)}
    
    Please analyze these and call the `submit_analysis` tool with your selection.
    """

    headers = {"Authorization": f"Bearer {NVIDIA_API_KEY}"}
    payload = {
        "model": "nvidia/nvidia-nemotron-nano-9b-v2",  # Or your preferred model
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "tools": [output_tool],
        "tool_choice": {"type": "function", "function": {"name": "submit_analysis"}},
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                NVIDIA_API_URL, headers=headers, json=payload, timeout=30
            )
            response.raise_for_status()

        message = response.json()["choices"][0]["message"]

        if message.get("tool_calls"):
            tool_call_args_str = message["tool_calls"][0]["function"]["arguments"]
            print(f"--- 🤖 CLIENT: AI analysis received: {tool_call_args_str} ---")

            ai_response_json = json.loads(tool_call_args_str)
            return ai_response_json
        else:
            raise ValueError(
                "Nemotron did not call the required `submit_analysis` tool."
            )

    except Exception as e:
        print(f"--- ❌ NEMOTRON ANALYSIS ERROR: {e} ---")
        best_match = max(scored_matches, key=lambda h: h["score"]["matchScore"])
        return {
            "bestMatchID": best_match["id"],
            "rationale": "Error during AI analysis. Defaulting to highest-scoring match.",
        }


def build_graph_json(
    all_scored_houses: list, best_match_id: str, criteria: schemas.PropertyCriteria
):
    """
    Builds the graph JSON from the FULL list of scored houses.
    - Creates nodes for ALL properties.
    - Only creates edges for properties with a score > 0.
    """
    print("--- 🛠️ CLIENT: Building full graph JSON... ---")
    criteria_str = f"Search: {criteria.location}, <${criteria.max_price}, {criteria.min_beds}+ beds, {criteria.min_baths}+ baths"

    # Center node
    nodes = [
        {
            "id": "search_criteria",
            "label": criteria_str,
            "type": "search",  # Added a type for the frontend
        }
    ]
    edges = []

    for house in all_scored_houses:
        nodes.append(
            {
                "id": house["id"],
                "label": f"{house['address']} - ${house['price']}",
                "isBestMatch": house["id"] == best_match_id,
                "type": "property",
                "score": house["score"]["matchScore"],  # Send the score to the frontend
            }
        )

        # Only create an edge if the property matched at least one criteria
        if house["score"]["matchScore"] > 0:
            edges.append(
                {
                    "from": "search_criteria",
                    "to": house["id"],
                    "label": f"{house['score']['matchScore']}/3 match",  # Add a label for the edge
                }
            )

    return {"nodes": nodes, "edges": edges}
