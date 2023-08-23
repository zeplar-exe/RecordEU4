import re
import time
import orjson
import uuid
from datetime import datetime

from animated_replay.service.config import *
from animated_replay.service import event_handlers
from animated_replay.shared.animation_data import AnimationData

import platformdirs

LOG_EVENT_ARGUMENT_SEPERATOR = "||"
TARGET_LOG_PREFIX = "[effectimplementation.cpp:24081]: EVENT "
TARGET_LOG_REGEX = re.compile(f"\[effectimplementation\.cpp:24081\]: EVENT \[(\d+\.\d+\.\d+)\]:ANIMATED_REPLAY ([-'\w {re.escape(LOG_EVENT_ARGUMENT_SEPERATOR)}]+)")

this_file_path = os.path.dirname(os.path.realpath(__file__))
today = datetime.today()

script_log_file = open("animated_replay.log.txt", "a+")
eu4_log_file = open(os.path.join(EU4_LOG_DIRECTORY, "game.log"), "r")

script_log_file.write(f"Running AnimatedReplay (PID {os.getpid()})" + "\n")
script_log_file.flush()

animation_data = AnimationData()

user_data_dir = platformdirs.user_data_dir()
data_output_file = None

while True:
    time.sleep(READ_GAME_EVENTS_DELAY_MS / 1000)

    for line in eu4_log_file.readlines():
        if not line.startswith(TARGET_LOG_PREFIX): continue

        match = TARGET_LOG_REGEX.match(line)

        if not match: continue

        date_string = match.group(1)

        try:
            date = datetime.strptime(date_string.replace(".", ""), "%Y%m%d").date()
        except ValueError:
            script_log_file.write(f"Invalid date '{date_string}'" + "\n")
        
        arguments = match.group(2).strip().split(LOG_EVENT_ARGUMENT_SEPERATOR)
        event = arguments[0]
        args = arguments[1:]

        handler = None

        try:
            handler = getattr(event_handlers, event)
        except AttributeError:
            script_log_file.write(f"Handler for event '{event}' not found." + "\n")

        if handler != None:
            handler(date, animation_data, args)

    if animation_data.game_start_date == None:
        continue

    if data_output_file == None:
        dir_name = f"{str(today).replace(':','_').replace('.', '_')}_{str(animation_data.game_start_date)}"
        path = os.path.join(user_data_dir, "AnimatedReplayEU4", dir_name, "data.json")

        os.makedirs(os.path.dirname(path), exist_ok=True)

        data_output_file = open(path, "w+")

        script_log_file.write(f"Created JSON output as '{path}'." + "\n")

    json_dict = {
        "game_start_date": str(animation_data.game_start_date),
        "initial_province_ownership": animation_data.initial_province_ownership,
        "events": list(map(lambda e: e.export(), animation_data.events))
    }

    data_output_file.seek(0)
    data_output_file.write(orjson.dumps(json_dict).decode("ansi"))
    data_output_file.truncate()

    if VERBOSE_LOG_OUTPUT:
        script_log_file.write("Updated JSON output." + "\n")

    data_output_file.flush()
    script_log_file.flush()
