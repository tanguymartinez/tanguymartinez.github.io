# Installation

## Data extraction toolchain
To install the toolchain, you have to manually run the following command once:

`python3 release.py release.zip tmp_csv_folder/ data/ nrt.sh nrt.py`

Where path have been stripped for clarity.
Here:

* `release.py` is the main entry point script.
* `release.zip` is the release file containing csv files.
* `tmp_csv_folder` is a folder used to extract the .zip file. It is temporary and should be empty before reunning the command.
* `data` is the output folder. It will contain the data as JSON files alongside the `index.json` file.
* `nrt.sh` is the output script containing the NRT extraction commands. It will be installed at a later time using cron jobs.
* `nrt.py` is the script converting the extracted NRT data to JSON.

You should use absolute paths. Here is an example of a working command:

`/usr/bin/python3.6 /home/users/nrt_user/ICOS/prog/ICOS-ATC_scripts/release.py /home/users/nrt_user/ICOS/data/NRT/ICOS_ATC_L2_L2-2019.1.zip /home/users/nrt_user/ICOS/data/NRT/release_csv/ /home/users/nrt_user/ICOS/data/NRT/data/ /home/users/nrt_user/ICOS/prog/ICOS-ATC_scripts/nrt.sh /home/users/nrt_user/ICOS/prog/ICOS-ATC_scripts/nrt.py`

Once you have initialized the toolchain with the above command, you can either run the following command manually or install it in a cron job:

`python3 map_tree.py data/ data/index.json`

Same as before, the paths have been stripped for the sake of understanding however, they should come as absolute paths.

Here is an example of a working command below:

`/usr/bin/python3.6 /home/users/nrt_user/ICOS/prog/ICOS-ATC_scripts/map_tree.py /home/users/nrt_user/ICOS/data/NRT/data/ /home/users/nrt_user/ICOS/data/NRT/data/index.json`

## JavaScript datavisualization module

When everything is in place, you can go ahead and install the JavaScript module. What we did was to create a root-level directory in the Drupal folder containing the module files. That way, we could create an iframe integrated in a Drupal basic page (via the source button). The `index.php` file of the module receives a trigram as a GET parameter and injects it in a `<script>` tag. It is in turn used in the main script to fetch the available data index.