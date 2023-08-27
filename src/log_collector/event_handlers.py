from datetime import date as datetime_date

from recording_data import *
from recording_event import *

def on_startup(date: datetime_date, recording_data: RecordingData, args: list):
    setup_country_tag = args[0]
    
    recording_data.game_start_date = date



def startup_province(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    province_name = args[1]

    province = recording_data.initial_provinces.get(province_id)

    if province is None:
        province = recording_data.initial_provinces[province_id] = Province(province_id, province_name)

def startup_province_ownership(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    country_tag = args[1]

    province = recording_data.initial_provinces[province_id]
    province.owner = country_tag

def startup_province_occupation(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    country_tag = args[1]

    province = recording_data.initial_provinces[province_id]
    province.occupier = country_tag

def on_siege_won_country(date: datetime_date, recording_data: RecordingData, args: list):
    winner_tag = args[0]
    province_id = args[1]

    recording_data.events.append({
        "type": RecordingEventType.province_occupied,
        "date": date,
        "province": province_id,
        "occupier": winner_tag
    })

def on_province_owner_change(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    new_owner_tag = args[1]
    old_owner_tag = args[2]

    recording_data.events.append({
        "type": RecordingEventType.province_owner_changed,
        "date": date,
        "province": province_id,
        "new_owner": new_owner_tag,
        "old_owner": old_owner_tag
    })

def on_province_siege_progress(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    garrison = args[1]
    sieger_tag = args[2]

    recording_data.events.append({
        "type": RecordingEventType.siege_progress,
        "date": date,
        "province": province_id,
        "sieger": sieger_tag
    })

def on_abandon_colony(date: datetime_date, recording_data: RecordingData, args: list):
    province_id = args[0]
    country_tag = args[1]

    recording_data.events.append({
        "type": RecordingEventType.province_abandoned,
        "date": date,
        "province": province_id
    })