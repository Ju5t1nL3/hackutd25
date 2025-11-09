from . import clients, schemas

async def generate_opportunity_graph(request: schemas.GraphRequest):
    """
    Orchestrates the graph generation workflow.
    1. Parses unstructured notes into structured criteria.
    2. Scores all available properties based on that criteria.
    3. Asks AI to analyze the scored list.
    4. Builds and returns the graph response.
    """
    print(f"--- 🚀 SERVICE: Generating graph for notes: {request.callLogNotes} ---")

    # 1. NEW: Parse notes into structured criteria
    criteria_json = await clients.extract_criteria_from_notes(request.callLogNotes)
    criteria = schemas.PropertyCriteria(**criteria_json)

    # 2. Score ALL properties using the extracted criteria
    all_scored_houses = await clients.score_properties(criteria)

    if not all_scored_houses:
        return {"bestMatch": None, "graphData": {"nodes": [], "edges": []}}

    # 3. Ask Nemotron to analyze the full, scored list
    analysis = await clients.get_ai_analysis(
        scored_matches=all_scored_houses, 
        criteria=criteria
    )

    best_match_id = analysis.get("bestMatchID")
    rationale = analysis.get("rationale")

    # 4. Find the best match object from our full list
    best_match_obj = next(
        (house for house in all_scored_houses if house["id"] == best_match_id),
        all_scored_houses[0], 
    )
    best_match_obj["rationale"] = rationale

    # 5. Build the final graph JSON
    graph_data = clients.build_graph_json(
        all_scored_houses=all_scored_houses, 
        best_match_id=best_match_id, 
        criteria=criteria
    )

    return {"bestMatch": best_match_obj, "graphData": graph_data}
