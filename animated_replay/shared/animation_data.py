from datetime import date as datetime_date

from animated_replay.shared.animation_event import AnimationEvent

class AnimationData:
    def __init__(self):
        self.game_start_date: datetime_date = None
        self.initial_province_ownership: dict[str, list[str]] = {}
        self.events: list[AnimationEvent] = []