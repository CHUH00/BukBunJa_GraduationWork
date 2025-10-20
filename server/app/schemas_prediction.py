from __future__ import annotations
from pydantic import BaseModel, Field, root_validator, validator
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
import json


class PredictionNumberJSON(BaseModel):
    """
    Schema for recommended numbers. Accepts either Python list (from DB), JSON string, or dict.
    """
    numbers: List[int] = Field(default_factory=list)
    bonus_number: Optional[int] = None

    @validator("numbers", pre=True)
    def parse_numbers(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                try:
                    return [int(x.strip()) for x in v.split(",") if x.strip()]
                except Exception:
                    return []
        if isinstance(v, (list, tuple)):
            return list(v)
        if isinstance(v, dict) and "numbers" in v:
            return v.get("numbers", [])
        return []


class PredictionJSON(BaseModel):
    """
    Main Prediction schema used as response/request DTO.
    - prediction_id: optional (new records before DB insert won't have it)
    - settings: always normalized to dict (if string -> parse json)
    - recommended_numbers: nested schema
    """
    prediction_id: Optional[int] = None
    draw_number: Optional[int] = None
    created_at: Optional[datetime] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    recommended_numbers: Optional[Union[PredictionNumberJSON, Dict[str, Any], str]] = None

    @root_validator(pre=True)
    def normalize_inputs(cls, values):
        if "prediction_id" not in values:
            values["prediction_id"] = None

        settings_val = values.get("settings")
        if isinstance(settings_val, str):
            try:
                values["settings"] = json.loads(settings_val)
            except Exception:
                try:
                    values["settings"] = json.loads(settings_val.replace("'", '"'))
                except Exception:
                    values["settings"] = {}
        elif settings_val is None:
            values["settings"] = {}

        rn = values.get("recommended_numbers")
        if isinstance(rn, str):
            try:
                rn_parsed = json.loads(rn)
                values["recommended_numbers"] = PredictionNumberJSON(**rn_parsed)
            except Exception:
                pass
        elif isinstance(rn, dict):
            values["recommended_numbers"] = PredictionNumberJSON(**rn)
        elif isinstance(rn, PredictionNumberJSON):
            values["recommended_numbers"] = rn

        return values