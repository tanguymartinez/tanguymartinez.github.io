## Datavisualization for ICOS data
The present tool was designed to plot ICOS' annual data release alongside NRT (near real time) data on the same graph.

### File tree
#### Back-end
- `extract_utils.py`
- `release.py`
- `nrt.py`
- `map_tree.py`

##### `extract_utils.py`
Utility class used to convert CSV sheets to JSON.

##### `release.py`
Main entry point.

##### `nrt.py`
Run nrt extracts for each release file.

##### `map_tree.py`
Map folder structure once generation is complete.

#### Front-end (JS)
The files in use are as follows:
- `Injector.js`
- `FileManager.js`
- `Controller.js`
- `InterfaceManager.js`
- `GraphManager.js`

All the files except `Injector.js` are ES2015 modules encapsulating a revealing module corresponding their respective file name (e.g. `Controller.js` encapsulate the `Controller` module). The goal was for the program to be modular and extensible. In that regard, revealing modules can be instanciated multiple times.

##### `Injector.js`
Dependency injection simple implementation.

##### `FileManager.js`
Fetches and stores ICOS data files.

##### `Controller.js`
Middleman between back-end and front-end.

##### `InterfaceManager.js`
UI manager.

##### `GraphManager.js`
Deals with the plotting library (highcharts.js currently).