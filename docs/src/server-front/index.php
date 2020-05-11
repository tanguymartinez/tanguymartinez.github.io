<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="Description" content="Compare data across ICOS ATC Stations">
    <title>Highcharts</title>
    <link rel="stylesheet" href="index.css">
    <script type="text/javascript" src="highcharts.js"></script>
    <script type="text/javascript" src="boost.js"></script>
    <script type="text/javascript">
        <?php
        function station($station) {
            if (!isset($station) || empty($station) || !preg_match("/^[A-Z]{3}$/", $station)) {
                return;
            }
            echo "const station = '". $_GET['station'] ."';";
        }
        station($_GET['station']);
        ?>
    </script>
    <script src="index.js" type="module"></script>
</head>
<body>
    <div id="wrapper"></div>
</body>
</html>