import { GraphManager } from "./GraphManager.js";

/**
 * The interfacemanager is responsible for the UI
 * @namespace InterfaceManagerModule
 */

/**
 * @namespace InterfaceManager
 * @memberof InterfaceManagerModule
 */

/**
 * @typedef InterfaceManager
 * @property {Function} init {@link InterfaceManagerModule.InterfaceManager~initialize}
 * @property {Function} initElements {@link InterfaceManagerModule.InterfaceManager~initElements}
 * @property {Function} dataReceived {@link InterfaceManagerModule.InterfaceManager~dataReceived}
 * @property {Function} setgetbuttonhandler {@link InterfaceManagerModule.InterfaceManager~setGetButtonHandler}
 * @property {Function} key {@link InterfaceManagerModule.InterfaceManager~publicAPI}
 */

/**
 * InterfaceManager revealing module
 * @memberof InterfaceManagerModule.InterfaceManager
 * @inner
 * @returns {InterfaceManager}
 */

function InterfaceManager() {

    /**
     * Root container
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {HTMLElement}
     */
    var root;

    /**
     * Key used on elements to link with data
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Symbol}
     */
    var KEY;

    /**
     * Path components
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Array.<string>}
     */
    var components;

    /**
     * getButton associated with the current instance
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {HTMLButtonElement}
     */
    var getButton;

    /**
     * Handler for the get button
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Function}
     */
    var getButtonHandler; //handlers;

    /**
     * Store GraphManager references
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Array.<GraphManager>}
     */
    var charts;

    /**
     * Symbol location for passing options to a series
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Symbol}
     */
    var customPropertiesKey;

    /**
     * Order in which to print the charts
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Array.<String>}
     */
    const order = ["CO2", "CH4", "CO"];

    const COLORS = [
        ["#8FFFC7", "#FF9B8F"],
        ["#8AFF88", "#FF87C6"],
        ["#FFEE77", "#9078FF"],
        ["#FF9748", "#47EAFF"],
        ["#FF6247", "#59FFB8"],
        ["#FF4773", "#67FF7D"],
        ["#BE47FF", "#DEFF54"]
    ];

    /**
     * Match height series to predefined colors
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @type {Object}
     */
    var heights_colors = Object.create(null);

    /**
     * Initialize module
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     */
    function initialize() {
        root = document.getElementById('wrapper');
        KEY = Symbol("Object key link");
        charts = [];
        customPropertiesKey = Symbol("Charts' custom general properties");
        Highcharts[customPropertiesKey] = Object.create(null);
    }

    /**
     * Create required elements, such as:
     * - wrapper
     * - selects
     * - get button
     * Initialize options
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @param {Object} tree Input tree
     * @param {Array.<string>} cpts Path components
     */
    function initElements(tree, cpts) {
        components = cpts;
        order.forEach((specie) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('wrapper');
            const target = document.createElement('div');
            target.classList.add('target');
            wrapper.appendChild(target);
            const graphManager = GraphManager();
            graphManager.init(target, specie, customPropertiesKey);
            charts.push(graphManager);
            const choicesWrapper = document.createElement('div');
            const element = tree[specie];
            const label = document.createElement('p');
            label.innerText = "Pick the desired height (in meters):";
            label.classList.add('label');
            const s = document.createElement('select');
            s.classList.add('choices');
            s.addEventListener('change', (function (t) {
                return function (e) {
                    selectUpdated(e, t);
                };
            })(tree[specie]));
            var keys = Object.keys(element).sort((a, b) => parseFloat(a) > parseFloat(b));
            keys.forEach(height => {
                if (element.hasOwnProperty(height)) {
                    const elt = document.createElement('option');
                    elt.classList.add('choice');
                    elt.value = height;
                    elt.innerText = height;
                    var subs = Object.keys(element[height]).sort().reduce((acc, cur, idx, src) => {
                        acc.push(element[height][cur].linkKey);
                        return acc;
                    }, []);
                    elt[KEY] = subs;
                    s.appendChild(elt);
                }
            });
            const linksContainer = document.createElement('div');
            linksContainer.classList.add('links-container');
            choicesWrapper.appendChild(label);
            choicesWrapper.appendChild(s);
            getButton = document.createElement('button');
            getButton.innerText = 'Get data';
            getButton.addEventListener('click', getClicked);
            choicesWrapper.appendChild(getButton);
            wrapper.appendChild(choicesWrapper);
            wrapper.appendChild(linksContainer);
            root.appendChild(wrapper);
        });
    }

    /**
     * Event handler for select onchange event
     * 
     * Update UI upon change event
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @param {Event} event Event
     * @param {Object} tree The data tree
     */
    function selectUpdated(event, tree) {
        const t = event.target;
        const value = t.value;
        const optionIdx = t.selectedIndex;
    }

    /**
     * When data is received, add data as a series to the graph (through GraphManager)
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @param {Object} d Data
     * @param {Number} opions Options:\
     * * emitterIdx: emitter graph index
     * * name: name of series
     */
    function dataReceived(d, options) {
        if (!heights_colors[options.height]) {
            heights_colors[options.height] = COLORS.pop();
        }
        var color = heights_colors[options.height][options.idx];
        charts[options.emitterIdx].addSeries(d, {
            name: options.name,
            color: color
        });
    }

    /**
     * Event handler for get button onclick event
     * 
     * Goes down as follows:
     * 1. getButtonHandler is set to a function (closure) from the Controller
     * 2. Attached to get button
     * 3. Triggered via get button
     * 4. getButtonHandler is called, passing parameters to the Controller
     * 5. {@link ControllerModule.Controller~getDataFromSymbol} is called with said parameters
     * 6. {@link FileManagerModule.FileManager~retrieve} is called with passed symbol (lying in the option element)
     * 7. {@link InterfaceManagerModule.InterfaceManager~dataReceived} is called to update the graph with the fetched data
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @param {Event} e Event
     */
    function getClicked(e) {
        const select = e.target.parentNode.children[1];
        const opt = select[select.selectedIndex];
        const wrapper = e.target.parentNode.parentNode;
        const wrapperIdx = [...wrapper.parentNode.children].indexOf(wrapper);
        getButtonHandler(opt[KEY], {
            emitterIdx: wrapperIdx,
            names: ["Release", "NRT"].map((name) => opt.value + " - " + name), // alphabetically sorted names
            height: opt.value,
            species: charts[wrapperIdx].getSpecies()
        });
        opt.parentNode.removeChild(opt);
        if (select.children.length == 0) {
            select.parentNode.parentNode.removeChild(select.parentNode);
        }
    }

    /**
     * Set fn as handler for get button
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @param {Function} fn Function set as the get button handler
     */
    function setGetButtonHandler(fn) {
        getButtonHandler = fn;
    }

    function addSeriesLink(text, href, emitterIdx) {
        document.querySelectorAll('.wrapper')[emitterIdx].querySelector('.links-container').innerHTML += `<a href="${href}" rel="nofollow" target="_blank">${text}</a>`;
    }

    /**
     * @memberof InterfaceManagerModule.InterfaceManager
     * @inner
     * @name publicAPI
     * @type {InterfaceManager}
     */
    var publicAPI = {
        init: initialize,
        initElements: initElements,
        dataReceived: dataReceived,
        setGetButtonHandler: setGetButtonHandler,
        key: function () {
            return KEY;
        },
        addSeriesLink: addSeriesLink
    };
    return publicAPI;
}

export { InterfaceManager };
