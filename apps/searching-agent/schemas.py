from pydantic import BaseModel


class SearchRequest(BaseModel):
    """The request model for the /start-search background task"""

    query: str
    location: str
    max_price: float | None = None
    min_beds: int | None = None


class GraphRequest(BaseModel):
    """The request model for the /generate-graph endpoint"""

    location: str
    max_price: float | None = None
    min_beds: int | None = None
    # Add any other criteria from the call log
