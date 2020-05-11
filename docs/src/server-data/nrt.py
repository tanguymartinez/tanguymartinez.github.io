"""Script to be exectued for each release file (NRT wise)
Converts and removes csv files
Takes care malformed files"""

import argparse
import pathlib
from extract_utils import ICOSData


parser = argparse.ArgumentParser(description='Process arguments')
parser.add_argument('input', help='Source file (csv)')
parser.add_argument('output', help='Output file (json)')
args = parser.parse_args()

csv = pathlib.Path(args.input)
if not csv.is_file():
    raise Exception("Source is not a file, file expected")

json = pathlib.Path(args.output)
if csv.is_dir():
    raise Exception("Source is a directory, file expected")

if csv.stat().st_size == 0:
    csv.unlink()
    raise SystemExit()  # Empty file

try:
    # Grab csv data and turn it into exploitable object
    dt = ICOSData.from_csv(csv)
except StopIteration:
    csv.unlink()
    raise SystemExit()

if len(dt._data) == 0:
    csv.unlink()
    raise SystemExit()  # No data

with json.open("w") as output:
    dt.json(output)

csv.unlink()
