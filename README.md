# RecordEU4

RecordEU4 allows you to record your EU4 campaigns and replay them at a later date. 

Now, behold this piss-poor README.

## Installation

There are three parts to RecordEU4 that must be managed for installation.

### Mod

The [mod](https://github.com/zeplar-exe/RecordEU4/tree/master/mod) can be setup via the EU4 launcher or by creating your own .mod files and placing them in ~/Documents/Paradox Interactive/Europa Universalis 4/mod. Enable it in the launcher and Voila, nothing else is needed on your part.

> As of now, [the mod depends on there being exactly 4939 provinces](https://github.com/zeplar-exe/RecordEU4/issues/3). If you are using a modified map, make sure to update [/common/scripted_effects/rec_set_prov_vars.txt](https://github.com/zeplar-exe/RecordEU4/blob/master/mod/common/scripted_effects/rec_set_prov_vars.txt).

### Log Collector

The [log collector](https://github.com/zeplar-exe/RecordEU4/tree/master/src/log_collector) is a [python](https://www.python.org/downloads/) project that can be extracted anywhere. A requirements.txt is provided. Make sure to update config.py with correct paths for EU4_DOCUMENTS_DIRECTORY and EU4_GAME_DIRECTORY.

### Desktop Application

The [desktop application](https://github.com/zeplar-exe/RecordEU4/tree/master/src/app) is a [NodeJS](https://nodejs.org/en) project that can be extracted anywhere.

## Usage

### Log Collector

The log collector can be run via `python main.py` or `pythonw main.py`, and that's it, it'll run in a console or in the background respectively. 

> Note that the collector relies on the game.log file created by EU4 to create a recording. This file is reset whenever EU4 is opened. Alternatively, you can pass a file path like so `python main.py ./file/path/to/my/saved/log/file.txt`, causing the collector to read it as the log file instead.

### Desktop Application

The application can be run via `npm start`, opening an electron window. To replay a recording, select it from the left-hand panel to begin loading it. Once loaded, the map can be panned and zoomed using the mouse. In the bottom right hand corner, the recording can be played, paused, and stepped.