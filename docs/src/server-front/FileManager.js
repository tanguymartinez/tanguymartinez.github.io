// get('http://localhost/graphs/data/json/CMN/8/L2/co2.json').then((response) => {
//     let start = Date.now();
//     let time_co2 = toTuples2(JSON.parse(response));
//     myChart.addSeries({
//         name: 'L2',
//         data: time_co2
//     });
//     console.log(Date.now() - start);
// }).then(() => get('http://localhost/graphs/data/json/CMN/8/NRT/co2.json')).then((response) => {
//     let time_co2 = toTuples2(JSON.parse(response));
//     myChart.addSeries({
//         name: 'NRT',
//         data: time_co2,
//         color: "rgb(75,0,130)"
//     });
// });
/**
 * FileManager is the backend
 * @namespace FileManagerModule
 */

/**
 * @namespace FileManager
 * @memberof FileManagerModule
 */
/**
 * @typedef FileManager
 * @property {Function} init {@link FileManagerModule.FileManager~initialize}
 * @property {Function} loadIndex {@link FileManagerModule.FileManager~loadIndex}
 * @property {Function} getTree {@link FileManagerModule.FileManager~getTree}
 * @property {Function} registerLink {@link FileManagerModule.FileManager~registerLink}
 * @property {Function} components {@link FileManagerModule.FileManager~publicAPI}
 * @property {Function} retrieve {@link FileManagerModule.FileManager~retrieve}
 */
/**
 * @typedef Tree
 * @property {Function} init {@link FileManagerModule.FileManager.Tree~initialize}
 * @property {Function} getTree {@link FileManagerModule.FileManager.Tree~renderTree}
 * @property {Function} components {@link FileManagerModule.FileManager.Tree~publicAPI}
 */
/**
 * FileManager revealing module
 * @memberof FileManagerModule
 * @inner
 * @param {string} path Path to data directory
 * @param {string} trigram Station trigram
 * @returns {FileManager} publicAPI Public api
 */
function FileManager(path, trigram) {
    /**
     * Tree revealing module
     * @namespace Tree
     * @memberof FileManagerModule.FileManager
     * @param {Object} data Data
     */
    function Tree(data) {

        /**
         * The working tree
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         */
        var tree;

        /**
         * Path components for the directories
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @type {Array.<string>}
         */
        var pathComponents;

        /**
         * Path components for directories specie order
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @type {Array.<string>}
         */
        var pathComponentsSpecies;

        /**
         * Initialize Tree
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         */
        function initialize() {
            tree = JSON.parse(data);
            pathComponents = ['trigrams', 'heights', 'species', 'releases'];
            pathComponentsSpecies = ['trigrams', 'species', 'heights', 'releases'];
        }

        /**
         * Traverse tree and build path using args
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param  {...any} args Components of path
         * @returns {string} Full path to the specified components
         */
        function getPathFull(...args) {
            if (args.length != pathComponents.length) {
                return null;
            }
            var obj = pathComponents.reduce((acc, cur, idx, src) => {
                var componentIdx = acc.obj[cur].indexOf(args[idx]);
                if (componentIdx == -1) {
                    return null;
                }
                acc.path += `/${args[idx]}`;
                acc.obj = acc.obj.data[componentIdx];
                return acc;
            }, {
                obj: tree,
                path: ""
            });
            return `${obj.path}/${obj.obj}`;
        }

        /**
         * Get path between two points in tree
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param {Tree} baseTree Input tree
         * @param {Array.<string>} basePathComponents  components to walk through
         * @param  {...any} args Components left
         * @returns {Object} Partial tree
         */
        function getPathFromUntil(baseTree, basePathComponents, ...args) {
            if (args.length < 1 || args.length > pathComponents.length) {
                return null;
            }
            var obj = basePathComponents.slice(0, args.length).reduce((acc, cur, idx, src) => {
                var componentIdx = acc.subtree[cur].indexOf(args[idx]);
                if (componentIdx == -1) {
                    return null;
                }
                acc.path += `/${args[idx]}`;
                acc.subtree = acc.subtree.data[componentIdx];
                acc.index = idx;
                return acc;
            }, {
                subtree: baseTree,
                path: "",
                index: 0
            });
            return obj;
        }

        /**
         * Get path until last argument
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param  {...any} args Components to walk through until last
         * @returns {Object} Tree after walking args through components
         */
        function getPathUntil(...args) {
            if (args.length < 1 || args.length > pathComponents.length) {
                return null;
            }
            var obj = pathComponents.slice(0, args.length).reduce((acc, cur, idx, src) => {
                var componentIdx = acc.subtree[cur].indexOf(args[idx]);
                if (componentIdx == -1) {
                    return null;
                }
                acc.path += `/${args[idx]}`;
                acc.subtree = acc.subtree.data[componentIdx];
                acc.index = idx;
                return acc;
            }, {
                subtree: tree,
                path: "",
                index: 0
            });
            return obj;
        }

        /**
         * Get heights tree for specific trigram
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param {string} trigram Trigram
         * @returns {Object} Tree after walking args through trigram component
         */
        function getHeights(trigram) {
            return getPathUntil(trigram);
        }

        /**
         * Swap order of tree: no longer height>specie but specie>height
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param {string} trigram Trigram
         * @returns {Object} The inverted tree in specie->height order
         */
        function getSpeciesTree(trigram) {
            var heights_obj = getHeights(trigram);
            var result = {
                species: [],
                data: []
            };
            heights_obj.subtree.heights.forEach((height_cur, height_idx, height_arr) => {
                var ownSpecies = heights_obj.subtree.data[height_idx].species;
                ownSpecies.forEach((specie_cur, specie_idx, specie_arr) => {
                    if (result.species.indexOf(specie_cur) == -1) {
                        result.species.push(specie_cur);
                    }
                    if (height_idx < 1) {
                        result.data.push({
                            heights: [],
                            data: []
                        });
                    }
                    result.data[specie_idx].heights.push(height_cur);
                    result.data[specie_idx].data.push(heights_obj.subtree.data[height_idx].data[specie_idx]);
                });
            });
            return result;
        }

        /**
         * Walk the tree and build usable new tree
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @param {Object} tree The default tree
         * @param {Array.<String>} components Path components for the tree
         * @param {string} path Path
         * @param {Array.<Object>} elements Array of objects
         */
        function walk(tree, components, path, elements) {
            if (components.length > 0) {
                tree[components[0]].forEach((value, idx, arr) => {
                    var a = path.slice();
                    a.push(value);
                    walk(tree.data[idx], components.slice(1), a, elements);
                });
            }
            else if (tree) {
                var sidx = pathComponentsSpecies.indexOf('species') - 1;
                if (sidx == -1) {
                    return;
                }
                var hidx = pathComponentsSpecies.indexOf('heights') - 1;
                if (hidx == -1) {
                    return;
                }
                var pathCopy = path.slice();
                var tmp = path[sidx];
                path[sidx] = path[hidx];
                path[hidx] = tmp;
                elements.push({
                    path: pathCopy,
                    pathFull: getPathFull(trigram, ...path),
                });
            }
        }

        /**
         * Utility function to build the usable tree
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @returns {Array} The constructed array
         */
        function renderTree() {
            var elts = [];
            walk(getSpeciesTree(trigram), pathComponentsSpecies.slice(1), [], elts);
            return elts;
        }

        /**
         * Public API for the Tree module
         * @memberof FileManagerModule.FileManager.Tree
         * @inner
         * @type {Tree}
         */
        var publicAPI = {
            init: initialize,
            getTree: renderTree,
            components: () => pathComponentsSpecies.slice()
        };
        return publicAPI;
    }

    /**
     * Tree module instance
     * @type {Tree}
     * @memberof FileManagerModule.FileManager
     * @inner
     */
    var index;

    /**
     * Path of the root directory from which data is fetched
     * @memberof FileManagerModule.FileManager
     * @inner
     * @type {string}
     */
    var path;

    /**
     * Station trigram
     * @memberof FileManagerModule.FileManager
     * @inner
     * @type {string}
     */
    var trigram;

    /**
     * Name of the index file
     * @memberof FileManagerModule.FileManager
     * @inner
     * @type {string}
     */
    var indexName = "index.json";

    /**
     * Store links
     * @memberof FileManagerModule.FileManager
     * @inner
     * @type {Object.<Symbol, string>}
     */
    var links;

    /**
     * Store data
     * @memberof FileManagerModule.FileManager
     * @inner
     * @type {Object.<Symbol, Blob>}
     */
    var blobs;

    /**
     * Get the file at the specified url from the server
     * @memberof FileManagerModule.FileManager
     * @inner
     * @param {string} url The url to fetch from
     * @returns {Promise} The promise resolving with fetched data
     */
    function get(url) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                if (req.status == 200) {
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = function () {
                reject(Error("Network Error"));
            };
            req.send();
        });
    }

    /**
     * Initialize module
     * @memberof FileManagerModule.FileManager
     * @inner
     */
    function initialize() {
        path = path;
        trigram = trigram;
        links = [];
        blobs = [];
    }

    /**
     * Register link in the links object, at the sy key
     * @memberof FileManagerModule.FileManager
     * @inner
     * @param {string} link The link to register
     * @param {Symbol} sy The symbol used as a key
     */
    function registerLink(link, sy) {
        links[sy] = link;
    }

    /**
     * Get the index.json file for future use
     * @memberof FileManagerModule.FileManager
     * @inner
     */
    async function loadIndex() {
        const data = await get(path + indexName);
        index = new Tree(data);
        index.init();
    }

    /**
     * Utility function to return the index's tree
     * @memberof FileManagerModule.FileManager
     * @inner
     * @returns {Object}
     */
    function getTree() {
        return index.getTree(trigram);
    }

    /**
     * Get data associated with sy symbol
     * @memberof FileManagerModule.FileManager
     * @inner
     * @param {Symbol} sy The symbol key
     * @returns {string} Data
     */
    function retrieve(sy) {
        return new Promise((resolve, reject) => {
            get(path + links[sy]).then((d) => {
                blobs[sy] = d;
                resolve(d);
            }).catch((e) => {
                reject(e);
            })
        });
    }

    /**
     * API exposed when instantiating
     * @memberof FileManagerModule.FileManager
     * @inner
     * @name publicAPI
     * @type {FileManager}
     */
    var publicAPI = {
        init: initialize,
        loadIndex: loadIndex,
        getTree: getTree,
        registerLink: registerLink,
        components: () => index.components(),
        retrieve: retrieve
    };
    return publicAPI;
}

export { FileManager };