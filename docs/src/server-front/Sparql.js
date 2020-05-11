const collectionPIDKey = 'collectionPID';
const initial = window.localStorage.getItem(collectionPIDKey) || "0ZW_MoG88K1_hdu8Xag8ExMf";
const endpoint = 'https://meta.icos-cp.eu/sparql';
const collections = 'https://meta.icos-cp.eu/collections/';
const objects = 'https://data.icos-cp.eu/objects/';

function prefix(target) {
    return function (src) {
        return `${target}${src}`;
    };
}

var cls = prefix(collections);


function match(...args) {
    if (args.length < 2) {
        return false;
    }
    const link = args.shift();
    return args.reduce((acc, cur, idx, arr) => {
        return acc && link.includes(cur);
    }, true);
}

const regPID = /.*\/(.*?)$/;

async function getDirectLinkRelease(trigram, height, species) {

    /**
     * Get the latest version for the specified collection
     * @param {String} collection Collection PID
     * @returns {Array.<Object>}
     */
    function getLatestVersion(collection) {
        return fetch(endpoint, {
            method: 'POST',
            body: `SELECT ?release WHERE {
          ?release <http://meta.icos-cp.eu/ontologies/cpmeta/isNextVersionOf> <${collection}> .
        }`
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response.status);
            }
        }).then((json) => {
            if (json.results.bindings.length > 0) {
                return getLatestVersion(json.results.bindings[0].release.value);
            } else {
                return collection;
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    return await getLatestVersion(cls(initial)).then((link) => {

        /**
         * Fetches parts of the specified collection (release)
         * @param {String} collectionLink 
         * @returns {String} Sparql request
         */
        const linkPIDRequest = (collectionLink) => `PREFIX cls: <${collections}>
        SELECT ?link ?name WHERE {
         <${collectionLink}> <http://purl.org/dc/terms/hasPart> ?link .
         ?link <http://meta.icos-cp.eu/ontologies/cpmeta/hasName> ?name .
        }`;

        window.localStorage.setItem(collectionPIDKey, link.match(regPID)[1]);
        return fetch(endpoint, {
            method: 'POST',
            body: linkPIDRequest(link)
        });
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response.status);
        }
    }).then((json) => {
        const found = json.results.bindings.find((val) => match(val.name.value, trigram, height, species));
        return `${objects}${found.link.value.match(regPID)[1]}`;
    });
}

async function getDirectLinkNRT(trigram, height, species) {
    const linkSpeciesDataObject = (s) => `http://meta.icos-cp.eu/resources/cpmeta/atc${s[0].toUpperCase() + s.slice(1).toLowerCase()}NrtGrowingDataObject`;
    const requestNRT = (trigram, height, species) => `SELECT ?link WHERE {
        ?link <http://meta.icos-cp.eu/ontologies/cpmeta/hasObjectSpec> <${linkSpeciesDataObject(species)}> .
        ?link <http://meta.icos-cp.eu/ontologies/cpmeta/wasAcquiredBy> ?acq .
        ?acq <http://meta.icos-cp.eu/ontologies/cpmeta/hasSamplingHeight> "${height}"^^xsd:float .
        ?acq <http://www.w3.org/ns/prov#wasAssociatedWith> <http://meta.icos-cp.eu/resources/stations/AS_${trigram}> .
        ?acq <http://www.w3.org/ns/prov#endedAtTime> ?endDate
       } 
       ORDER BY DESC (?endDate)
       LIMIT 1`;

    return await fetch(endpoint, {
        method: 'POST',
        body: requestNRT(trigram, height, species)
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(reponse.status);
        }
    }).then((json) => {
        if (json.results.bindings.length <= 0) {
            return;
        }
        return `${objects}${json.results.bindings[0].link.value.match(regPID)[1]}`;
    });
}

export { getDirectLinkRelease, getDirectLinkNRT };