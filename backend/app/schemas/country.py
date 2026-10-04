from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CountryCreate(BaseModel):
    name: str
    code: str
    currency: str


class CountryUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    currency: str | None = None


class CountryResponse(BaseModel):
    id: int
    name: str
    code: str
    currency: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)