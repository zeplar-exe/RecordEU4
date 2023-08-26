import os
import sys
import platformdirs

if sys.platform == "linux":
    EU4_DOCUMENTS_DIRECTORY = os.path.expanduser("~/.local/.share/Paradox Interactive/Europa Universalis IV/")
else: # For Windows and macOS
    EU4_DOCUMENTS_DIRECTORY = os.path.expanduser("~/Documents/Paradox Interactive/Europa Universalis IV/")


EU4_GAME_DIRECTORY = os.path.expanduser("~/Desktop/Europa Universalis IV Domination/")

VERBOSE_LOG_OUTPUT = True


# Advanced (more like technical stuff that doesn't really need to be configurable)

READ_GAME_EVENTS_DELAY_MS = 10000
APP_DATA_DIRECTORY = os.path.join(platformdirs.user_data_dir(roaming=True, ensure_exists=True), "RecordEU4")