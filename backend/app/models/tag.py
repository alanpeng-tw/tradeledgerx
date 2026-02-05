from enum import Enum
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field

class TagType(str, Enum):
    STRATEGY = "STRATEGY"
    MISTAKE = "MISTAKE"

class Tag(Document):
    name: Indexed(str, unique=True)
    type: TagType
    color: str = Field(pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    is_system_default: bool = False
    
    class Settings:
        name = "tags"
