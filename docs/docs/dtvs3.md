# Datavisualization module

## Intro

The JavaScript module's role is to fetch and display data as Highchart instances.
The JavaScript code documentation is available on the left menu under ["JavaScript module documentation"](dtvs-js/index.html).
However, the processes involved are described here.
The module consists of several files:

* [`Injector.js`](dtvs-js/InjectorModule.Injector.html): A simple dependency injection module
* [`FileManager.js`](dtvs-js/FileManagerModule.html): The module responsible for data fetching, storing and processing
* [`Controller.js`](dtvs-js/ControllerModule.Controller.html): The interface between the Controller and the InterfaceManager
* [`InterfaceManager.js`](dtvs-js/InterfaceManagerModule.InterfaceManager.html): Manages the interface and most notably the GraphManager instances
* [`GraphManager.js`](dtvs-js/GraphManagerModule.GraphManager.html): Handles a single chart (mostly Highchart specific code)
* [`Sparql.js`](dtvs-js/Sparql.js.html): The module for fetching the series' links
* `index.php`: The main PHP file
* [`index.css`](../../src/server-front/index.css): The module stylesheet
* [`index.js`](../../src/server-front/index.js): The JavaScript entry point
* `highcharts.js`: The Highcharts library
* `boost.js`: An Highcharts addon to boost performances

## Description

The entry point of the JavaScript module is `index.js`. Its role is to bootstrap the application. The modules are instanciated and eventually the `Controller` is rendered, in turn triggering the fetching of the index file by the `FileManger` module.

The `FileManager` fetches the JSON index file and proceeds to parse it (upon the [`loadIndex`](dtvs-js/FileManagerModule.FileManager.html#~loadIndex) function call). It will then be able to request data at a given URL and store the result in an array.

### Data fetching

A linking step is executed before anytihng. The linkage happens in the `Controller` when it prepares the data for the interface (specifically in the [`buildInterfaceTree`](dtvs-js/ControllerModule.Controller.html#~buildInterfaceTree) method). An identifier is created, bound to a specific link in the `FileManager` and eventually stored in the corresponding entry of said data. When the interface is being initialized, each option of the interface is associated with the identifier we just mentioned. This way, when a series is requested, when just have to pass the identifier to the `FileManager`'s [`retrieve`](dtvs-js/FileManagerModule.FileManager.html#~retrieve) method and wait for data to be returned.

### Chart management

Chart management is done in the `InterfaceManager` module which contains a list of charts. The crosshairs are synchronized in the [`initialize`](dtvs-js/GraphManagerModule.GraphManager.html#~initialize) method by overriding the default mousemove, touchmove and touchstart events. The zoom is also synchronized through the `syncExtremes` function. The rest of the customizations are contained within the properties of the chart itself. The bottom legend of each graph is updated when you zoom (see the `selection` event). For instance, if the graph is zoomed out, only years will show. If it is zoomed in at the maximum level, the day and the hour will show.

### Series' links

The links displayed when you load a series are queried against the ICOS Data Sparql endpoint ([API endpoint](http://meta.icos-cp.eu/), [browser-based version](https://meta.icos-cp.eu/sparqlclient)) by the [`Sparql`](dtvs-js/Sparql.js.html) module.


