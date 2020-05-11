import { FileManager } from "./FileManager.js";
import { InterfaceManager } from "./InterfaceManager.js";
import { Controller } from "./Controller.js";
import { Injector } from "./Injector.js";

// MAIN
var inj = Injector();
var fm = FileManager("https://icos-atc.lsce.ipsl.fr/sites/default/files/data/NRT/data/", station);
fm.init();
inj.register('FileManager', fm);
var im = InterfaceManager();
im.init();
inj.register('InterfaceManager', im);
var controller = inj.resolve(['FileManager', 'InterfaceManager'], Controller)();
controller.init();
controller.render().then(() => {
    for (let choice of document.getElementsByClassName('choices')) {
        choice.parentNode.querySelector('button').click();
    }
    return;
});
