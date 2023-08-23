from enum import Enum
from datetime import date as datetime_date

class AnimationEvent:
    def __init__(self, date: datetime_date):
        self.type = self.__class__.__name__
        self.date = date
    
    def export(self) -> dict:
        return vars(self)

class ProvinceOccupiedEvent(AnimationEvent):
    def __init__(self, date: datetime_date, province, country):
        super().__init__(date)
        self.province = province
        self.country = country

class ProvinceConqueredEvent(AnimationEvent):
    def __init__(self, date: datetime_date, province, country):
        super().__init__(date)
        self.province = province
        self.country = country

class ProvinceColonizedEvent(AnimationEvent):
    def __init__(self, date: datetime_date, province, country):
        super().__init__(date)
        self.province = province
        self.country = country

class ProvinceAbandonedEvent(AnimationEvent):
    def __init__(self, date: datetime_date, province):
        super().__init__(date)
        self.province = province