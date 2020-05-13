# Datavisualization module

## Intro

The Python module processes the initial release zip file. It uses the extracted data to:

1. Generate the correct file tree to store the JSON files
2. Store the JSON-converted extracted CSV files at the correct location in the file tree 
3. Build a shell script which extracts NRT data and then converts it to JSON (cleaning the residual CSV files)
4. Create a JSON index file to be used by the JavaScript module

It consists of the following files:

* `extract_utils.py`: a utility to parse a CSV extracted file
* `map_tree.py`: maps the file tree and outputs a JSON index file
* `nrt.py`: the script converting the extracted NRT data to JSON
* `release.py`: the main entry point script
* `utils.py`: helpers (not used currently)