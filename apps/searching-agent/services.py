from . import clients, schemas


async def generate_opportunity_graph(criteria: schemas.GraphRequest):
    """
    Orchestrates the graph generation workflow.
    1. Scores all available properties based on criteria.
    2. Asks AI to analyze the scored list.
    3. Builds and returns the graph response.
    """
    print(f"--- 🚀 SERVICE: Generating graph for: {criteria.location} ---")

    # 1. Score ALL properties (this replaces the old "filter")
    all_scored_houses = await clients.score_properties(criteria)

    if not all_scored_houses:
        return {"bestMatch": None, "graphData": {"nodes": [], "edges": []}}

    # 2. Ask Nemotron to analyze the full, scored list
    analysis = await clients.get_ai_analysis(
        scored_matches=all_scored_houses, criteria=criteria
    )

    best_match_id = analysis.get("bestMatchID")
    rationale = analysis.get("rationale")

    # 3. Find the best match object from our full list
    best_match_obj = next(
        (house for house in all_scored_houses if house["id"] == best_match_id),
        all_scored_houses[0],  # Default to first house if ID fails
    )

    # Add the AI's rationale to the object
    best_match_obj["rationale"] = rationale

    # 4. Build the final graph JSON from the FULL scored list
    graph_data = clients.build_graph_json(
        all_scored_houses=all_scored_houses,
        best_match_id=best_match_id,
        criteria=criteria,
    )

    return {"bestMatch": best_match_obj, "graphData": graph_data}
