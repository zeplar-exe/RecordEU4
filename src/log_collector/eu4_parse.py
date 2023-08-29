import re
import glob

from config import *
from recording_data import *

def get_definitions(file):
    lines = []

    if isinstance(file, str):
        lines = file.split("\n", "\r", "\r\n")
    else:
        lines = file.readlines()

    for line in lines:
        if line.isspace():
            continue

        if line.strip().startswith("#"):
            continue

        definition = line.split("=")

        if len(definition) != 2:
            continue

        name = definition[0].strip()
        value = definition[1].strip()

        yield (name, value)

def get_country_definitions():
    results = []

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
                results.append(country)
    
    return results