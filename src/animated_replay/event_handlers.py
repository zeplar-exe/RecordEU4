from datetime import date as datetime_date

from animation_data import AnimationData
from animation_event import AnimationEventType

def on_startup(date: datetime_date, anim_data: AnimationData, args: list):
    setup_nation = args[0]
    
    anim_data.game_start_date = date

def on_startup_province(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    country = args[1]

    inner = anim_data.initial_province_ownership.get(country)

    if inner is None:
        anim_data.initial_province_ownership[country] = list([ province ])
    else:
        inner.append(province)

def on_siege_won_country(date: datetime_date, anim_data: AnimationData, args: list):
    winner = args[0]
    province = args[1]

    anim_data.events.append({
        "type": AnimationEventType.province_occupied,
        "date": date,
        "province": province,
        "controller": winner
    })

def on_province_owner_change(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    new_owner = args[1]
    old_owner = args[2]

    anim_data.events.append({
        "type": AnimationEventType.province_owner_changed,
        "date": date,
        "province": province,
        "new_owner": new_owner,
        "old_owner": old_owner
    })

def on_province_siege_progress(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    sieger = args[1]

    anim_data.events.append({
        "type": AnimationEventType.siege_progress,
        "date": date,
        "province": province,
        "sieger": sieger
    })

def on_abandon_colony(date: datetime_date, anim_data: AnimationData, args: list):
    province = args[0]
    country = args[1]

    anim_data.events.append({
        "type": AnimationEventType.province_abandoned,
        "date": date,
        "province": province
    })