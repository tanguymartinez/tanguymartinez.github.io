"""Initialization script
To run every time a new release is out
Initializes the file tree
Converts csv files contained in the release and outputs a bash script meant to be run every day (NRT)"""

import argparse
import zipfile
import pathlib
import re
import datetime
from extract_utils import ICOSData

parser = argparse.ArgumentParser(description='Process arguments')
parser.add_argument('source', help='Source file (zip file)')
parser.add_argument('store', help='Extract directory')
parser.add_argument('destination', help='Output directory')
parser.add_argument('commands', help='Output commands file')
parser.add_argument('nrt', help='nrt script path (python file)')
dest = pathlib.Path("/home/users/nrt_user/ICOS/data/NRT/")
args = parser.parse_args()

# Check arguments
ste = pathlib.Path(args.store)
if ste.is_file():
    raise Exception("Store directory is a file, directory expected")
if ste.is_dir() and any(True for _ in ste.iterdir()):
    raise Exception("Store directory should be empty")

dest = pathlib.Path(args.destination)
if dest.is_file():
    raise Exception("Destination is a file, directory expected")
if dest.is_dir() and any(True for _ in ste.iterdir()):
    raise Exception("Destination should be empty")

names = []
src = pathlib.Path(args.source)
if not src.is_file():
    raise Exception("Source is not a file, file expected")

commands_file = pathlib.Path(args.commands)
if commands_file.is_dir():
    raise Exception("Commands file is a directory, file expected")

nrt = pathlib.Path(args.nrt)
if not nrt.is_file():
    raise Exception("nrt file is not a file, file expected")

with zipfile.ZipFile(src, "r") as zip_ref:  # Unzip archive and grab file's names
    names = zip_ref.namelist()
    zip_ref.extractall(ste)

# Prepare commands
commands = []
base = "/home/icos/PROG/launch EXTRACTDATA -hdf {},CD -site {} -s {} -t air -sh {} -cts > {}"

for name in names:  # For each file in release
    dt = ICOSData.from_csv(ste / name)  # Process each file
    p = dest / dt.path()
    p1 = p / "L2"
    p2 = p / "NRT"
    p1.mkdir(parents=True, exist_ok=True)  # Create file tree
    p2.mkdir(parents=True, exist_ok=True)
    filename_json = "data.json"
    with open(p1 / filename_json, "w") as output:  # Output json
        dt.json(output)
    # Gather data used for NRT commands (start date, end date, trigram, parameter, sampling height)
    end_date = re.search(
        r'[0-9]{4}-([0-9]{2})-[0-9]{2}T[0-9]{2}:[0-9]{2}$',
        dt._comments['COVERING PERIOD']
    ).group(0)
    # start_date = (datetime.datetime.fromisoformat(end_date) + datetime.timedelta(minutes=1)).isoformat() # python 3.7+
    start_date = (datetime.datetime.strptime(
        end_date,
        "%Y-%m-%dT%H:%M") + datetime.timedelta(minutes=1)
    ).isoformat()
    site = dt._comments['STATION CODE']
    specie = dt._comments['PARAMETER']
    sampling_height = re.search(
        r'([0-9]+\.[0-9]+)', dt._comments['SAMPLING HEIGHTS']).group(1)
    filename_csv = "data.csv"
    absolute_csv = str((p2 / filename_csv).resolve())
    absolute_json = str((p2 / filename_json).resolve())
    # Append commands to commands' list
    commands.append(base.format(start_date,
                                site,
                                specie,
                                sampling_height,
                                absolute_csv)
                    )
    commands.append(f'/usr/bin/python3.6 {nrt} {absolute_csv} {absolute_json}')

with (commands_file).open("w") as nrt_commands:  # Write commands' list to bash script
    nrt_commands.write('\n'.join(commands))
