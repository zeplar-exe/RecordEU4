from datetime import date as datetime_date
from dataclasses import dataclass

class AnimationData:
    def __init__(self):
        self.game_start_date: datetime_date = None
        self.initial_provinces: dict[str, Province] = {}
        self.countries: dict[str, Country] = {}
        self.events: list[dict] = []

@dataclass
class Province:
    def __init__(self, id, name):
        self.id: str = id
        self.name: str = name
        self.owner: str = None
        self.occupier: str = None

@dataclass
class Country:
    def __init__(self, tag, color):
        self.tag: str = tag
        self.color: list[int] = color