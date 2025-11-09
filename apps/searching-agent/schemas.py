from pydantic import BaseModel


class SearchRequest(BaseModel):
    """The request model for the /start-search background task"""

    query: str
    location: str
    max_price: float | None = None
    min_beds: int | None = None


class GraphRequest(BaseModel):
    """The request model for the /generate-graph endpoint"""

    callLogNotes: str
    # Add any other criteria from the call log


class PropertyCriteria(BaseModel):
    """The structured data extracted from notes"""

    location: str
    max_price: float | None = None
    min_beds: int | None = None
    min_baths: int | None = None  # <-- We'll add baths here
