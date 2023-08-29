import re
import sys
import time
import glob
import orjson
import shutil
from datetime import datetime

import event_handlers
from config import *
from recording_data import *
from eu4_parse import *
from util import *

import platformdirs
import easygui

APP_DATA_DIRECTORY = os.path.join(platformdirs.user_data_dir(roaming=True, ensure_exists=True), "RecordEU4")

LOG_EVENT_ARGUMENT_SEPERATOR = "||"
TARGET_LOG_REGEX = re.compile(
    f"\[effectimplementation\.cpp:\d+\]: EVENT \[(\d+\.\d+\.\d+)\]:RECORD_EU4 ([-'\w {re.escape(LOG_EVENT_ARGUMENT_SEPERATOR)}]+)")

script_log_file = open("record_eu4.log.txt", "a+")

def log(message):
    global script_log_file

    print(message)
    script_log_file.write(message + "\n")

def log_verbose(message):
    global VERBOSE_LOG_OUTPUT, script_log_file

    if not VERBOSE_LOG_OUTPUT:
        return

    print(message)
    script_log_file.write(message + "\n")

log(f"Running RecordEU4 (PID {os.getpid()})")
script_log_file.flush()

eu4_log_file = None
recording_data = RecordingData()
data_output_file = None
line_read_count = 0
last_file_length = 0

def init_state():
    global eu4_log_file, recording_data, data_output_file, line_read_count, last_file_length

    if eu4_log_file:
        eu4_log_file.close()

    input_log_file = sys.argv[1:2] or None

    if input_log_file == None:
        eu4_log_file = open(os.path.join(EU4_DOCUMENTS_DIRECTORY, "logs/game.log"), "r")
    else:
        eu4_log_file = open(input_log_file[0])

    recording_data = RecordingData()

    if data_output_file:
        data_output_file.close()

    data_output_file = None
    line_read_count = 0
    last_file_length = 0

    country_definitions = get_country_definitions()

    for definition in country_definitions:
        recording_data.countries[definition.tag] = definition

    log_verbose("Completed country data read.")

init_state()

while True:
    time.sleep(READ_GAME_EVENTS_DELAY_MS / 1000)

    for line in eu4_log_file.readlines():
        if last_file_length > os.path.getsize(eu4_log_file.name):
            init_state()
            continue

        match = TARGET_LOG_REGEX.match(line)

        if not match: 
            continue

        date_string = match.group(1)

        try:
            date = datetime.strptime(date_string.replace(".", ""), "%Y%m%d").date()
        except ValueError:
            log(f"Invalid date '{date_string}' in log '{line}'")
            continue

        arguments = match.group(2).strip().split(LOG_EVENT_ARGUMENT_SEPERATOR)
        event = arguments[0]
        args = arguments[1:]

        try:
            handler = getattr(event_handlers, event)

            handler(date, recording_data, args)
        except AttributeError:
            log(f"Handler for event '{event}' not found.")
            continue
        
        line_read_count += 1
        if line_read_count % LINE_READ_LOG_INTERVAL == 0:
            log_verbose(f"Progress: {line_read_count} lines read on current iteration.")

    if recording_data.game_start_date is None:
        continue

    if data_output_file is None:
        recordings_dir = os.path.join(APP_DATA_DIRECTORY, "recordings")
        default_dir_name = f"{str(datetime.today()).replace(':', '_').replace('.', '_')}_{str(recording_data.game_start_date)}"
        dir_name = None
        prompt = "What would you like to name this recording?\nLleave blank or cancel to use default."
        
        while dir_name == None:
            user_input = easygui.enterbox(prompt, "RecordEU4")
            
            if user_input is None or user_input == "" or user_input.isspace(): # Cancellation or Blank or Spaces
                dir_name = default_dir_name
            else:
                if not is_pathname_valid(user_input):
                    prompt = "Invalid path, try again."
                elif os.path.exists(os.path.join(recordings_dir, user_input)):
                    prompt = f"{user_input} already exists, try again."
                else:
                    dir_name = user_input
        
        recording_dir = os.path.join(recordings_dir, dir_name)

        os.makedirs(recording_dir, exist_ok=True)

        data_file_path = os.path.join(recording_dir, "data.json")
        data_output_file = open(data_file_path, "w+", encoding="ansi")

        log_verbose(f"Created recording as '{data_file_path}'.")

        os.makedirs(os.path.join(recording_dir, "map"), exist_ok=True)

        shutil.copy(os.path.join(EU4_GAME_DIRECTORY, "map/provinces.bmp"), os.path.join(recording_dir, "map/provinces.bmp"))
        shutil.copy(os.path.join(EU4_GAME_DIRECTORY, "map/definition.csv"), os.path.join(recording_dir, "map/definition.csv"))

    json_dict = {
        "game_start_date": str(recording_data.game_start_date),
        "initial_provinces": recording_data.initial_provinces,
        "countries": recording_data.countries,
        "events": recording_data.events
    }

    data_output_file.seek(0)
    data_output_file.write(orjson.dumps(json_dict).decode("ansi"))
    data_output_file.truncate()

    log_verbose("Updated recording.")

    data_output_file.flush()
    script_log_file.flush()
