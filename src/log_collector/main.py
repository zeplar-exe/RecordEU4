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

import platformdirs

LOG_EVENT_ARGUMENT_SEPERATOR = "||"
TARGET_LOG_REGEX = re.compile(
    f"\[effectimplementation\.cpp:\d+\]: EVENT \[(\d+\.\d+\.\d+)\]:ANIMATED_REPLAY ([-'\w {re.escape(LOG_EVENT_ARGUMENT_SEPERATOR)}]+)")

today = datetime.today()

script_log_file = open("record_eu4.log.txt", "a+")

input_log_file = sys.argv[1:2] or None
eu4_log_file = None

if input_log_file == None:
    eu4_log_file = open(os.path.join(EU4_DOCUMENTS_DIRECTORY, "logs/game.log"), "r")
else:
    eu4_log_file = open(input_log_file[0])

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

log(f"Running AnimatedReplay (PID {os.getpid()})")
script_log_file.flush()


recording_data = RecordingData()
data_output_file = None


country_target_file_path_re = re.compile("\"(.*)\"")

for country_tag_file in glob.iglob(os.path.join(EU4_GAME_DIRECTORY, "common/country_tags/**/*.txt"), recursive=True):
    with open(country_tag_file) as tag_file:
        for definition in get_definitions(tag_file):
            tag = definition[0]
            target_file_path = definition[1]
            match = country_target_file_path_re.match(target_file_path)

            if not match:
                continue

            target_file_path = match.group(1)

            if not os.path.isabs(target_file_path):
                target_file_path = os.path.join(EU4_GAME_DIRECTORY, "common", target_file_path)

            color = []

            with open(target_file_path) as target_file:
                for definition in get_definitions(target_file):
                    if definition[0] == "color":
                        color = list(map(int, definition[1].replace("{", "").replace("}", "").strip().split()))
                        break
            
            country = Country(tag, color)
            recording_data.countries[tag] = country

log_verbose("Completed country data read.")


while True:
    time.sleep(READ_GAME_EVENTS_DELAY_MS / 1000)

    for line in eu4_log_file.readlines():
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

        handler = None

        try:
            handler = getattr(event_handlers, event)

            handler(date, recording_data, args)
        except AttributeError:
            log(f"Handler for event '{event}' not found.")

    if recording_data.game_start_date is None:
        continue

    if data_output_file is None:
        dir_name = f"{str(today).replace(':', '_').replace('.', '_')}_{str(recording_data.game_start_date)}"
        replay_dir = os.path.join(APP_DATA_DIRECTORY, "replays", dir_name)

        os.makedirs(replay_dir, exist_ok=True)

        data_file_path = os.path.join(replay_dir, "data.json")
        data_output_file = open(data_file_path, "w+", encoding="ansi")

        log_verbose(f"Created JSON output as '{data_file_path}'.")

        os.makedirs(os.path.join(replay_dir, "map"), exist_ok=True)

        shutil.copy(os.path.join(EU4_GAME_DIRECTORY, "map/provinces.bmp"), os.path.join(replay_dir, "map/provinces.bmp"))
        shutil.copy(os.path.join(EU4_GAME_DIRECTORY, "map/definition.csv"), os.path.join(replay_dir, "map/definition.csv"))

    json_dict = {
        "game_start_date": str(recording_data.game_start_date),
        "initial_provinces": recording_data.initial_provinces,
        "countries": recording_data.countries,
        "events": recording_data.events
    }

    data_output_file.seek(0)
    data_output_file.write(orjson.dumps(json_dict).decode("ansi"))
    data_output_file.truncate()

    log_verbose("Updated JSON output.")

    data_output_file.flush()
    script_log_file.flush()
