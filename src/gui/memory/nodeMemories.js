/**
 * @preserve
 *
 *                                      .,,,;;,'''..
 *                                  .'','...     ..',,,.
 *                                .,,,,,,',,',;;:;,.  .,l,
 *                               .,',.     ...     ,;,   :l.
 *                              ':;.    .'.:do;;.    .c   ol;'.
 *       ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *      ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *     .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *      .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *     .:;,,::co0XOko'              ....''..'.'''''''.
 *     .dxk0KKdc:cdOXKl............. .. ..,c....
 *      .',lxOOxl:'':xkl,',......'....    ,'.
 *           .';:oo:...                        .
 *                .cd,      ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐    .
 *                  .l;     ║╣  │││ │ │ │├┬┘    '
 *                    'l.   ╚═╝─┴┘┴ ┴ └─┘┴└─   '.
 *                     .o.                   ...
 *                      .''''','.;:''.........
 *                           .'  .l
 *                          .:.   l'
 *                         .:.    .l.
 *                        .x:      :k;,.
 *                        cxlc;    cdc,,;;.
 *                       'l :..   .c  ,
 *                       o.
 *                      .,
 *
 *      ╦═╗┌─┐┌─┐┬  ┬┌┬┐┬ ┬  ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐  ╔═╗┬─┐┌─┐ ┬┌─┐┌─┐┌┬┐
 *      ╠╦╝├┤ ├─┤│  │ │ └┬┘  ║╣  │││ │ │ │├┬┘  ╠═╝├┬┘│ │ │├┤ │   │
 *      ╩╚═└─┘┴ ┴┴─┘┴ ┴  ┴   ╚═╝─┴┘┴ ┴ └─┘┴└─  ╩  ┴└─└─┘└┘└─┘└─┘ ┴
 *
 *
 * Created by Ben Reynolds on 11/10/17.
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Logic Node Memory Bar
 *
 * Allows user creation and selection of Logic Node memories.
 */

createNameSpace("realityEditor.gui.memory.nodeMemories");

realityEditor.gui.memory.nodeMemories.states = {
    memories: [],
    dragEventListeners: [],
    upEventListeners: []
};

// load any stored Logic Node memories from browser's local storage, and create DOM elements to visualize them
realityEditor.gui.memory.nodeMemories.initMemoryBar = function() {

    this.states.memories = JSON.parse(window.localStorage.getItem('realityEditor.memory.nodeMemories.states.memories') || '[]');

    var memoryBar = document.querySelector('.nodeMemoryBar');
    for (var i = 0; i < 5; i++) {
        var memoryContainer = document.createElement('div');
        memoryContainer.classList.add('memoryContainer');
        memoryContainer.setAttribute('touch-action', 'none');
        memoryContainer.style.position = 'relative';
        memoryBar.appendChild(memoryContainer);
    }
    
    this.renderMemories();
};

// Save a Logic Node to a given index (must be between 1-5 as of now)
realityEditor.gui.memory.nodeMemories.addMemoryAtIndex = function(logicNodeObject, index) {
    
    // a Logic Node can only exist in one pocket at a time - remove it from previous if being added to another
    var previousIndex = this.getIndexOfLogic(logicNodeObject);
    if (previousIndex !== index) {
        this.states.memories[previousIndex] = null;
    }

    // additional step to save the publicData and privateData of the blocks in the pocket,
    //   because this data usually only resides on the server
    var keys = realityEditor.gui.crafting.eventHelper.getServerObjectLogicKeys(logicNodeObject);
    realityEditor.network.updateNodeBlocksSettingsData(keys.ip, keys.objectKey, keys.frameKey, keys.logicKey);

    // convert logic node to a serializable object and assign it a new UUID
    if (index >= 0 && index < 5) {
        var simpleLogic = this.realityEditor.gui.crafting.utilities.convertLogicToServerFormat(logicNodeObject);
        simpleLogic.uuid = realityEditor.device.utilities.uuidTime();
        this.states.memories[index] = simpleLogic;
    }
    
    this.renderMemories();
    this.saveNodeMemories();
};

// saves each pocket logic node to the browser's local storage.
// also does a second pass to ensure all links are serializable. // TODO: this shouldn't be necessary. Fix bug before it gets here.
realityEditor.gui.memory.nodeMemories.saveNodeMemories = function() {
    
    // TODO: shouldn't need to do this each time if i correctly do it when the node gets added to the memory
    this.states.memories.forEach(function(logicNode) {
        if (logicNode && logicNode.hasOwnProperty('links')) {
            for (var linkKey in logicNode.links) {
                if (!logicNode.links.hasOwnProperty(linkKey)) continue;
                if (!!logicNode.links[linkKey].route) {
                    console.log("eliminating routes");
                    logicNode.links[linkKey] = realityEditor.gui.crafting.utilities.convertBlockLinkToServerFormat(logicNode.links[linkKey]);
                }
            }
        }
    });
    
    window.localStorage.setItem('realityEditor.memory.nodeMemories.states.memories', JSON.stringify(this.states.memories));
};

// Draws each saved Logic Node inside each pocket container DOM element
realityEditor.gui.memory.nodeMemories.renderMemories = function() {
    
    var memoryBar = document.querySelector('.nodeMemoryBar');
    this.states.memories.forEach( function(logicNodeObject, i) {
        
        // reset contents
        var memoryContainer = memoryBar.children[i];
        memoryContainer.innerHTML = '';
        memoryContainer.style.backgroundImage = '';
        memoryContainer.onclick = '';

        // stop if there isn't anything to render
        if (!logicNodeObject) return;

        // display contents. currently this is a generic node image and the node's name // TODO: give custom icons
        memoryContainer.style.backgroundImage = 'url(/svg/logicNode.svg)';
        
        var nameText = document.createElement('div');
        nameText.style.position = 'absolute';
        nameText.style.top = '33px';
        nameText.style.width = '100%';
        nameText.style.textAlign = 'center';
        nameText.innerHTML = logicNodeObject.name;
        memoryContainer.appendChild(nameText);
        
    });

    this.resetEventHandlers();
};

// TODO: ben look at this next...
// create a new instance of the saved logic node template, add it to the DOM and upload to the server
realityEditor.gui.memory.nodeMemories.createLogicNodeFromMemory = function(logicNodeMemory) {
    console.log("drop logic onto object based on memory", logicNodeMemory);

    var addedLogic = new Logic();
    
    if (logicNodeMemory) {
        // copy over most properties from the saved pocket logic node
        var keysToCopyOver = ['blocks', 'iconImage', 'lastSetting', 'lastSettingBlock', 'links', 'lockPassword', 'lockType', 'name', 'nameInput', 'nameOutput'];
        keysToCopyOver.forEach( function(key) {
            addedLogic[key] = logicNodeMemory[key];
        });
    }

    // give new logic node a new unique identifier so each copy is stored separately
    var logicKey = realityEditor.device.utilities.uuidTime();
    addedLogic.uuid = logicKey;
 
    var closestFrameKey = null;
    var closestObjectKey = null;
  
    var objectKeys = realityEditor.gui.ar.getClosestFrame(); // TODO: should we limit to only add these to AR frames?
    if(objectKeys[1] !== null) {
        closestFrameKey = objectKeys[1];
        closestObjectKey = objectKeys[0];
        var closestObject = objects[closestObjectKey];
        var closestFrame = closestObject.frames[closestFrameKey];
        
        addedLogic.objectId = closestObjectKey;
        addedLogic.frameId = closestFrameKey;

        addedLogic.x = 0;
        addedLogic.y = 0;
        
        addedLogic.scale = closestObject ? closestObject.averageScale : globalStates.defaultScale;
        addedLogic.screenZ = 1000;
        addedLogic.loaded = false;
        addedLogic.matrix = [];
        addedLogic.relativeMatrix = [];

        // make sure that logic nodes only stick to 2.0 server version
        if(realityEditor.network.testVersion(closestObjectKey)>165) {
            console.log('created node with logic key ' + logicKey + ' and added to ' + closestFrameKey);
            closestFrame.nodes[logicKey] = addedLogic;

            // render it
            var nodeUrl = "nodes/logic/index.html";
            
            realityEditor.gui.ar.draw.addElement(nodeUrl, closestObjectKey, closestFrameKey, logicKey, 'logic', addedLogic);

            var _thisNode = document.getElementById("iframe" + logicKey);
            if (_thisNode && _thisNode._loaded) {
                realityEditor.network.onElementLoad(closestObjectKey, logicKey);
            }
            
            // send it to the server
            realityEditor.network.postNewLogicNode(closestObject.ip, closestObjectKey, closestFrameKey, logicKey, addedLogic);

            realityEditor.gui.pocket.setPocketNode(addedLogic, {pageX: globalStates.pointerPosition[0], pageY: globalStates.pointerPosition[1]}, closestObjectKey, closestFrameKey);

            console.log("successfully added logic from pocket to object (" + closestObject.name + ", " + closestFrame.name + ")");
            return {
                logicNode: addedLogic,
                domElement: globalDOMCache[logicKey],
                objectKey: closestObjectKey,
                frameKey: closestFrameKey
            };
        }
    }

    console.log("couldn't add logic from pocket to any objects");
    return null;
};

// ensure there is a single drag handler on each memory container when the pocket is opened, so that they can only be dragged once.
// the handler will be removed after you start dragging the node. this re-adds removed handlers when you re-open the pocket.
realityEditor.gui.memory.nodeMemories.resetEventHandlers = function() {
    
    var memoryBar = document.querySelector('.nodeMemoryBar');
    
    var nodeMemories = realityEditor.gui.memory.nodeMemories;
    var dragEventListeners = nodeMemories.states.dragEventListeners;
    var upEventListeners = nodeMemories.states.upEventListeners;
    
    [].slice.call(memoryBar.children).forEach(function(memoryContainer, i) {
        
        if (dragEventListeners[i]) {
            memoryContainer.removeEventListener('pointermove', dragEventListeners[i], false);
            dragEventListeners[i] = null;
        }
        
        if (upEventListeners[i]) {
            memoryContainer.removeEventListener('pointerup', upEventListeners[i], false);
            upEventListeners[i] = null;
        }

        var overlay = document.getElementById('overlay');
        if (overlay.storedLogicNode) { // TODO: make it faster by only adding the type of listeners it needs right now (but make sure to add the others when they become needed)
            nodeMemories.addUpListener(memoryContainer, nodeMemories.states.memories[i], i);
        } else {
            nodeMemories.addDragListener(memoryContainer, nodeMemories.states.memories[i], i);
        }
    });
    
    var pocket = document.querySelector('.pocket');
    pocket.removeEventListener('pointerup', nodeMemories.touchUpHandler, false);
    pocket.addEventListener('pointerup', nodeMemories.touchUpHandler, false);
};

realityEditor.gui.memory.nodeMemories.touchUpHandler = function(event) {
    if (overlayDiv.storedLogicNode) {
        overlay.storedLogicNode = null;
        overlayDiv.classList.remove('overlayLogicNode');
        overlayDiv.innerHTML = '';
        realityEditor.gui.memory.nodeMemories.renderMemories();
    }
};

// hide the pocket and add a new logic node to the closest visible object, and start dragging it to move under the finger
realityEditor.gui.memory.nodeMemories.addDragListener = function(memoryContainer, logicNodeObject, i) {
    
    var nodeMemories = realityEditor.gui.memory.nodeMemories;
    var ar = realityEditor.gui.ar;
    
    // store each event listener in an array so that we can cancel them all later
    nodeMemories.states.dragEventListeners[i] = function(evt) {
        
        if (document.getElementById('overlay').storedLogicNode) {
            console.log("don't trigger drag events - we are carrying a logic node to save");
            return;
        }
        
        console.log('pointermove on memoryContainer for logic node ' + logicNodeObject.name);

        realityEditor.gui.pocket.pocketHide();
        console.log("move " + logicNodeObject.name + " to pointer position");

        var addedElement = nodeMemories.createLogicNodeFromMemory(logicNodeObject);

        addedElement.positionOnLoad = {
            pageX: evt.pageX,
            pageY: evt.pageY
        };

        var logicNodeSize = 220; // TODO: dont hard-code this - it is set within the iframe
        
        realityEditor.device.editingState.touchOffset = {
            x: logicNodeSize/2,
            y: logicNodeSize/2
        };

        realityEditor.device.beginTouchEditing(addedElement.objectKey, addedElement.frameKey, addedElement.logicNode.uuid);
            
            realityEditor.gui.menus.on("bigTrash",[]);
        // realityEditor.gui.menus.on("trashOrSave", []); // TODO: make this bigTrash again and adjust trash area check to be full size if just added from memory
        // }

        // remove the touch event listener so that it doesn't fire twice and create two Logic Nodes by accident
        memoryContainer.removeEventListener('pointermove', nodeMemories.states.dragEventListeners[i], false);
        nodeMemories.states.dragEventListeners[i] = null;
    };

    memoryContainer.addEventListener('pointermove', nodeMemories.states.dragEventListeners[i], false);
};

// if there is a pending logic node attached to the overlay waiting to be saved, store it in this memoryContainer
realityEditor.gui.memory.nodeMemories.addUpListener = function(memoryContainer, previousLogicNodeObject, i) {
    
    var nodeMemories = realityEditor.gui.memory.nodeMemories;
    
    // store each event listener in an array so that we can cancel them all later
    nodeMemories.states.upEventListeners[i] = function(evt) {

        var overlay = document.getElementById("overlay");
        if (overlay.storedLogicNode) {
            console.log("add logic node " + overlay.storedLogicNode.name + " to memory container " + i + "(replacing " + (previousLogicNodeObject ? previousLogicNodeObject.name : "nothing") + ")");

            nodeMemories.addMemoryAtIndex(overlay.storedLogicNode, i);

            overlay.storedLogicNode = null; // TODO: add an up listener everywhere to remove this
            overlayDiv.classList.remove('overlayLogicNode');
            overlayDiv.innerHTML = '';
            
            nodeMemories.renderMemories();
        }
        
        // remove the touch event listener so that it doesn't fire twice and create two Logic Nodes by accident
        memoryContainer.removeEventListener('pointerup', nodeMemories.states.upEventListeners[i], false);
        nodeMemories.states.upEventListeners[i] = null;
    };
    memoryContainer.addEventListener('pointerup', nodeMemories.states.upEventListeners[i], false);

};

// helper method to find out which pocket this Logic Node has already been saved into. Uses "name" to match
// TODO: can cause overlaps if different programs have same name, but better than ID because each ID must be unique... is there a better solution?
realityEditor.gui.memory.nodeMemories.getIndexOfLogic = function(logic) {
    return this.states.memories.map( function(logicNodeObject) {
        if (logicNodeObject) {
            return logicNodeObject.name;
        }
        return null;
    }).indexOf(logic.name);
};
