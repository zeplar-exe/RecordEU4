import os
import platformdirs

# For Windows and macOS
EU4_DOCUMENTS_DIRECTORY = os.path.expanduser("~/Documents/Paradox Interactive/Europa Universalis IV/")

# For Linux
# EU4_LOG_DIRECTORY = os.path.expanduser("~/.local/.share/Paradox Interactive/Europa Universalis IV/log")

EU4_GAME_DIRECTORY = os.path.expanduser("~/Desktop/Europa Universalis IV Domination/")
INCLUDE_EU4_MAP_DATA = True  # Whether to include copies of provinces.bmp and definitions.csv in animation output folders.

VERBOSE_LOG_OUTPUT = True


# Advanced (more like technical stuff that doesn't really need to be configurable)

READ_GAME_EVENTS_DELAY_MS = 10000
APP_DATA_DIRECTORY = os.path.join(platformdirs.user_data_dir(), "AnimatedReplayEU4")