import { getDirectLinkRelease, getDirectLinkNRT } from "./Sparql.js";

/**
 *  The controller is the middleman between the interface and the data (MVC) 
 * @namespace ControllerModule
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol}
 */

/**
 * @namespace Controller
 * @memberof ControllerModule
 */

/**
 * @typedef Controller
 * @property {Function} init {@link ControllerModule.Controller~initialize}
 * @property {Function} render {@link ControllerModule.Controller~render}
 */


/**
 * Controller revealing module
 * @memberof ControllerModule
 * @inner
 * @param {FileManager} filemanager FileManager dependency
 * @param {InterfaceManager} interfacemanager InterfaceManager dependency
 */
function Controller(filemanager, interfacemanager) {

    /**
     * Dependency
     * @memberof ControllerModule.Controller
     * @inner
     * @type {FileManager}
     */
    var FileManager;

    /**
     * Dependency
     * @memberof ControllerModule.Controller
     * @inner
     * @type {InterfaceManager}
     */
    var InterfaceManager;

    /**
     * Initialize
     * @memberof ControllerModule.Controller
     * @inner
     */
    function initialize() {
        FileManager = filemanager; // FileManager dependency
        InterfaceManager = interfacemanager; // InterfaceManager dependecy
        interfacemanager.setGetButtonHandler(getTrigerred()); // Set handler for interface get button
    }

    /**
    * Render the interface
    * @memberof ControllerModule.Controller
    * @inner
    */
    async function render() {
        await filemanager.loadIndex();
        var shallowTree = filemanager.getTree();
        var cmpts = filemanager.components().slice(1);
        var it = buildInterfaceTree(shallowTree, cmpts, filemanager);
        interfacemanager.initElements(it, cmpts);
        interfacemanager.setGetButtonHandler(getTrigerred());
    }

    /**
     * Generate handler for interface's get button
     * 
     * Bound to getDataFromSymbol(), triggers data retrieving and display. Uses closures to let the interface call the function with proper context
     * 
     * The resulting function is bound to the get button through {@link ControllerModule.Controller#render}
     * 
     * Passes trigram on get button click
     * @memberof ControllerModule.Controller
     * @inner
     * @returns {Symbol}
     */
    function getTrigerred() {
        return function (sys, options) {
            getDataFromSymbol(sys, options);
        };
    }

    /**
     * Called after the get button was clicked
     * 
     * Retrieve data associated with sy from the datamanager, then pass that data to interfacemanager
     * @see {@link https://developers.google.com/web/fundamentals/primers/promises#creating_a_sequence}
     * @memberof ControllerModule.Controller
     * @inner
     * @param {Array.<Symbol>} sys Array of symbols
     * @param {Object} options The index of the emitter graph @see {@link InterfaceManagerModule.InterfaceManager~dataReceived}
     */
    function getDataFromSymbol(sys, options) {
        sys.map(filemanager.retrieve)
            .reduce((acc, cur, idx, src) => {
                return acc.then(() => {
                    return cur;
                }).then((dataPiece) => {
                    interfacemanager.dataReceived(dataPiece, {
                        name: options.names[idx],
                        emitterIdx: options.emitterIdx,
                        height: options.height,
                        idx: idx
                    });
                    if (idx != 0) {
                        return;
                    }
                    getDirectLinkRelease(station, options.height, options.species).then((link) => {
                        interfacemanager.addSeriesLink(`Release @ ${options.height}`, link, options.emitterIdx);
                    }).then(() => {
                        return getDirectLinkNRT(station, options.height, options.species);
                    }).then((link) => {
                        interfacemanager.addSeriesLink(`NRT @ ${options.height}`, link, options.emitterIdx);

                    });
                });
            }, Promise.resolve());
    }

    /**
     * Turn array of paths into JS object
     * @memberof ControllerModule.Controller
     * @inner
     * @param {Array} data Possible paths
     * @param {Array} components Path components
     * @param {Object} fm FileManager
     * @returns {Object}
     */
    function buildInterfaceTree(data, components, fm) {
        var built = {};
        if (!(components.length == data[0].path.length)) {
            return;
        }
        data.forEach((pathPack, idx, arr) => {
            pathPack.path.reduce((prev, cur, pidx, parr) => {
                if (!prev.hasOwnProperty(cur)) {
                    Object.defineProperty(prev, cur, {
                        enumerable: true,
                        // value: (pidx == parr.length - 1) ? { path: pathPack.pathFull } : {}
                        value: {}
                    });
                }
                if (pidx == parr.length - 1) {
                    let dataLink = Symbol('Data link');
                    fm.registerLink(pathPack.pathFull, dataLink);
                    Object.defineProperty(prev[cur], "linkKey", {
                        value: dataLink
                    });
                }
                return prev[cur];
            }, built);
        });
        return built;
    }

    /**
     * API exposed when instantiating
     * @memberof ControllerModule.Controller
     * @inner
     * @name publicAPI
     * @type {Controller}
     */
    var publicAPI = {
        init: initialize,
        render: render
    };
    return publicAPI;
}

export { Controller };
