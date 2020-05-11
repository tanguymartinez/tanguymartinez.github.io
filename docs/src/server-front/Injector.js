/**
 * The injector is used to manage dependencies
 * @namespace InjectorModule
 * @see {@link https://en.wikipedia.org/wiki/Dependency_injection}
 */

/**
 * @namespace Injector
 * @memberof InjectorModule
 */

/**
 * @typedef Injector
 * @property {Function} register {@link InjectorModule.Injector~register}
 * @property {Function} resolve {@link InjectorModule.Injector~resolve}
 */

/**
 * Injector revealing module
 * @memberof InjectorModule
 * @inner
 */
function Injector() {

    /**
     * Dependencies store
     * @memberof InjectorModule.Injector
     * @inner
     * @type {Object}
     */
    var dependencies = {};

    /**
     * Register an instance in the container
     * @memberof InjectorModule.Injector
     * @inner
     * @param {string} key Name of the module
     * @param {Object} value Module instance
     */
    function register(key, value) {
        dependencies[key] = value;
    }

    /**
     * Get object instantiated from func with deps as args
     * @memberof InjectorModule.Injector
     * @inner
     * @param {Array.<string>} deps Dependencies to look up 
     * @param {Function} func Function constructor
     * @returns {Object} Created object
     */
    function resolve(deps, func) {
        var args = [];
        deps.forEach(elt => {
            if (dependencies[elt]) {
                args.push(dependencies[elt]);
            } else {
                throw new Error('Cannot resolve dependency');
            }
        });
        return function (...argts) {
            return func(...args.concat(argts));
        }
    }

    /**
     * API exposed when instantiating
     * @memberof InjectorModule.Injector
     * @inner
     * @name publicAPI
     * @type {Injector}
     */
    var publicAPI = {
        register: register,
        resolve: resolve
    }

    return publicAPI;
}

export { Injector };