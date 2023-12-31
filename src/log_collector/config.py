import os
import sys
import platformdirs

if sys.platform == "linux":
    EU4_DOCUMENTS_DIRECTORY = os.path.expanduser("~/.local/.share/Paradox Interactive/Europa Universalis IV/")
else: # For Windows and macOS
    EU4_DOCUMENTS_DIRECTORY = os.path.expanduser("~/Documents/Paradox Interactive/Europa Universalis IV/")

if (not os.path.exists(EU4_DOCUMENTS_DIRECTORY)):
    raise Exception(f"The given EU4 documents directory does not exist '{EU4_DOCUMENTS_DIRECTORY}', update it to the correct path in src/log_collector/config.py")

EU4_GAME_DIRECTORY = os.path.expanduser("~/Desktop/Europa Universalis IV Domination/")

if (not os.path.exists(EU4_GAME_DIRECTORY)):
    raise Exception(f"The given EU4 game directory does not exist '{EU4_GAME_DIRECTORY}', update it to the correct path in src/log_collector/config.py")

VERBOSE_LOG_OUTPUT = True
LINE_READ_LOG_INTERVAL = 100 # Requires verbose output


# Advanced (more like technical stuff that doesn't really need to be configurable)

READ_GAME_EVENTS_DELAY_MS = 4000