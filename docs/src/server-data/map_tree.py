"""Maps previously generated file tree and outputs result to json index file"""

import os
import re
import json
import argparse
import pathlib
from typing import List, Dict


def trigram(t: str) -> Dict:
    return {}


def scan_tree(path: pathlib.Path, depth: int) -> List:
    """Scan folders recursively"""
    array = []
    for dir in path.iterdir():
        if dir.is_dir() and depth > 0:
            array.append((dir.name, scan_tree(dir, depth - 1)))
        else:
            array.append(dir.name)
    return array


def scan_tree2(path: str, depth: int) -> List:
    """Scan folders recursively"""
    array = []
    for dir in os.scandir(path):
        if os.path.isdir(dir.path) and depth > 0:
            array.append((dir.name, scan_tree2(dir.path, depth - 1)))
        else:
            array.append(dir.name)
    return array


def build_validation_tree(tree: List, cursor: int = 0) -> List:
    """Path validation per component"""
    validation = []
    for part in tree:
        if isinstance(tree, list) and not isinstance(part, str):  # list of directories
            validation.append((True, build_validation_tree(
                part[1], cursor + 1)) if rules_compiled[cursor].match(part[0]) else False)
        elif isinstance(tree, list):  # files
            validation.append(
                True if rules_compiled[cursor].match(part) else False)
        else:  # directory
            validation.append(
                True if rules_compiled[cursor].match(part) else False)
            break
    return validation


def validate_tree(tree: List, validation_tree: List) -> List:
    """Validate the tree"""
    validated = []
    it = iter(validation_tree)
    for part in tree:
        v = next(it)
        if not v:
            continue
        if isinstance(tree, list) and not isinstance(part, str):  # list of directories
            validated.append((part[0], validate_tree(part[1], v[1])))
        elif isinstance(tree, list):  # files
            validated.append(part)
        else:  # directory
            validated.append(part)
            break
    return validated if validated else None


def concat(tree: List) -> List:
    """Concatenate links for each file/folder"""
    level = []
    for part in tree:
        if isinstance(tree, list) and not isinstance(part, str):  # list of directories
            level += [os.path.join(part[0], path) for path in concat(part[1])]
        elif isinstance(tree, list):  # files
            level.append(part)
        else:  # directory
            level.append(part)
    return level


def present_tree(tree: List, aggregate: int) -> Dict:
    """Output json"""
    links = {
        presenters[len(presenters) - aggregate]: [],
        'data': []
    }
    for part in tree:
        if isinstance(tree, list) and not isinstance(part, str) and aggregate > 1:  # list of directories
            if not part[1]:
                continue
            links[presenters[len(presenters) - aggregate]].append(part[0])
            links['data'].append(present_tree(part[1], aggregate - 1))
        elif isinstance(tree, list) and not isinstance(part, str):  # last folder
            links[presenters[len(presenters) - aggregate]].append(part[0])
            if isinstance(part[1], list):
                links['data'] += concat(part[1])
            else:
                links['data'].append(part[1])
        else:  # directory
            break
    return links


parser = argparse.ArgumentParser(description='Process arguments')
parser.add_argument('path', help='Path to scan')
parser.add_argument('output', help='Output json file name (saved in <path>)')
args = parser.parse_args()

path = pathlib.Path(args.path)
out = pathlib.Path(args.output)

presenters = ['trigrams', 'heights', 'species', 'releases']
# Rules per path component
rules = ['^[A-Z]{3}$',
         '^[0-9]+\.[0-9]+$',
         '^(CO2|CH4|CO)$',
         '^(L2|NRT)$',
         '^data\.json$'
         ]
rules_compiled = [re.compile(r) for r in rules]

tree = scan_tree(path, 4)
validation_tree = build_validation_tree(tree)
validated_tree = validate_tree(tree, validation_tree)  # Tree is correct
presented_tree = present_tree(validated_tree, 4)  # Generate final tree
with open(path / out, 'w') as f:  # Output tree to file
    json.dump(presented_tree, f, indent=4)
