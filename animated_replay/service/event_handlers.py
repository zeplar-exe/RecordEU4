from datetime import date as datetime_date

from animated_replay.shared.animation_data import AnimationData
from animated_replay.shared.animation_event import *

def on_startup(date: datetime_date, anim_data: AnimationData, args: list):
    setup_nation = args[0]
    
    anim_data.game_start_date = date

def on_startup_province(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    country = args[1]

    inner = anim_data.initial_province_ownership.get(country)

    if inner == None:
        inner = anim_data.initial_province_ownership[country] = list([ province ])
    else:
        inner.append(province)

def on_siege_won_country(date: datetime_date, anim_data: AnimationData, args: list):
    winner = args[0]
    province = args[1]

    anim_data.events.append(ProvinceOccupiedEvent(date, province, winner))

def on_province_owner_change(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    new_owner = args[1]
    old_owner = args[2]

    anim_data.events.append(ProvinceConqueredEvent(date, province, new_owner))

def on_province_siege_progress(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    sieger = args[1]

def on_abandon_colony(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    country = args[1]

    anim_data.events.append(ProvinceAbandonedEvent(date, province, country))