import csv, re, io, pickle, pathlib #, json, utils
from typing import List, Dict

class ICOSData:
    """ICOS data class utility"""
    def __init__(self):
        self._comments = {}
        self._header = []
        self._data = []
        self._ok = False

    def json(self, file: io.TextIOBase, row: bool = False, verbose: bool=False) -> None:
        """Output to json"""
        def to_json_verbose():
            """Set format to object notation"""
            def to_json_object(line: str) -> str:
                prop = [f"\"{self._header[i]}\": \"{value}\"" for (i, value) in enumerate(line)] # Each entry is a set of properties
                obj = ',\n\t\t'.join(prop)
                obj_surrounded = "{\n\t\t" + obj + "\n\t}"
                return obj_surrounded
            result = map(to_json_object, self._data)
            file.write("[\n\t" + ',\n\t'.join(result) + "\n]")

        def to_json_row():
            """Set format to row array"""
            container = []
            [container.append([]) for heading in self._header]
            [container[i].append(f"\"{heading}\"") for i, heading in enumerate(self._header)]
            [[container[i].append(f"\"{cell}\"") for i, cell in enumerate(line)] for line in self._data]
            file.write("[\n" + ''.join(["\t[{}],\n".format(', '.join(row)) for row in container]) + "\n]")
            #file.write(json.dumps(container))

        def to_json_column():
            """Set format to column array"""
            container = [["\"{}\"".format(h) for h in self._header]] + self._data
            file.write("[\n\t" + ',\n\t'.join(["[{}]".format(', '.join(["{}".format(cell) for cell in row])) for row in container]) + "\n]")
            #file.write(json.dumps(container))
                
        to_json_verbose() if verbose else (to_json_row() if row else to_json_column())


    def load(self, src: str) -> None:
        """Load pickle representation (serialized)"""
        with open(src, 'r') as source:
            return pickle.load(source)

    def path(self) -> pathlib.Path:
        return pathlib.Path(self._comments['STATION CODE'], re.match('^(-?[0-9]+.[0-9]+)',  self._comments['SAMPLING HEIGHTS']).group(1) ,  self._comments['PARAMETER'])
    
    @classmethod
    def dump(cls, dest: str) -> None:
        """Dump using pickle"""
        with open(dest, 'wb') as output:
            pickle.dump(cls, output)

    @classmethod
    def from_existing(cls, comments: Dict, header: List, data: List):
        """Build from parts"""
        constructed = cls()
        constructed._comments = comments
        constructed._header = header
        constructed._data = data
        return constructed
    
    @classmethod
    def from_csv(cls, source: str):
        """Load csv file"""
        with open(source) as csvfile:
            noise = 0
            while True:
                line = csvfile.readline()
                if line and re.match('^ *#', line) is None:
                    noise += 1
                else:
                    break
            csvfile.seek(0, io.SEEK_SET)
            comments_nb = 0
            for line in csvfile: # Seek number of comments (line starting with "HEADER LINES")
                comment = re.match('^# HEADER LINES: ([0-9]+)', line)
                if (comment is not None):
                    comments_nb += int(comment.group(1))
                    break
            comments_nb += noise
            csvfile.seek(0, io.SEEK_SET)
            comments_line = [next(csvfile) for i in range(comments_nb-1)]
            regs = [re.search('^# (.*?): (.*)$', line) for line in comments_line] # Convert list to regex result (split comment in two distinct part)
            regs_clean = filter(lambda elt: elt is not None, regs) # Clean list (remove None objects)
            comments = {reg.group(1):reg.group(2) for reg in regs_clean} # Extract results from regex and store as key:value pairs in dict
            header = next(csv.reader(io.StringIO(next(csvfile)[1:]), delimiter=';'))
            # selected_options = utils.pickFrom(header) # Select a subset of columns
            selected_options = [7, 8]
            header = [h for i, h in enumerate(header) if i in selected_options]
            reader = csv.reader((row for row in csvfile), delimiter=';') # Create csv reader for the remaining lines
            data = []
            for row in reader: # Iterate the lines of file
                data.append([cell for i, cell in enumerate(row) if i in selected_options]) # Only append selected columns
            return cls.from_existing(comments, header, data)

    @staticmethod
    def _read(source: str) -> None:
        """Open file as generator"""
        try:
            with open(source, newline='') as csvfile: # Open the files speficied as first arg
                while True:
                    data = csvfile.readline()
                    yield data
                    if not data:
                        break


        except Exception as error:
            print(type(error))
            print(error.args)