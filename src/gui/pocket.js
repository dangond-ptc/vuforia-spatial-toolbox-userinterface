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
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Valentin Heun
 * Modified by Valentin Heun 2014, 2015, 2016, 2017
 * Modified by Benjamin Reynholds 2016, 2017
 * Modified by James Hobin 2016, 2017
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

createNameSpace("realityEditor.gui.pocket");

realityEditor.gui.pocket.pocketButtonAction = function() {

	console.log("state: " + globalStates.pocketButtonState);

	if (globalStates.pocketButtonState === true) {
		console.log("buttonon");
		globalStates.pocketButtonState = false;

		if (globalStates.guiState === 'logic') {
		    realityEditor.gui.crafting.blockMenuVisible();

            realityEditor.gui.menus.on("crafting",["logicPocket"]);
		}
	}
	else {
		console.log("buttonoff");
		globalStates.pocketButtonState = true;

		if (globalStates.guiState === 'logic') {
			realityEditor.gui.crafting.blockMenuHide();
            realityEditor.gui.menus.off("crafting",["logicPocket"]);

        }
	}

};

realityEditor.gui.pocket.setPocketPosition = function(evt){
    
	if(pocketItem["pocket"].frames["pocket"].nodes[pocketItemId]){

		var thisItem = pocketItem["pocket"].frames["pocket"].nodes[pocketItemId];
		
		var pocketDomElement = globalDOMCache['object' + thisItem.uuid];
		if (!pocketDomElement) return; // wait until DOM element for this pocket item exists before attempting to move it

		if (realityEditor.gui.ar.draw.nodeCalculations.farFrontElement === "") {
		    
			thisItem.x = evt.clientX - (globalStates.height / 2);
			thisItem.y = evt.clientY - (globalStates.width / 2);
			
		} else {
		    
			if(thisItem.screenZ !== 2 && thisItem.screenZ) {
                
                var centerOffsetX = thisItem.frameSizeX / 2;
                var centerOffsetY = thisItem.frameSizeY / 2;
                
                realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(thisItem, evt.clientX - centerOffsetX, evt.clientY - centerOffsetY, false);

			}
		}
		
	}
};

/**
 * The Pocket button. Turns into a larger version or a delete button when
 * the user is creating memories or when the user is dragging saved
 * memories/programming blocks, respectively.
 */
(function(exports) {

    var pocket;
    var palette;
    var nodeMemoryBar;

    var inMemoryDeletion = false;

    var realityElements = [
        {
            name: 'reality-control-slider-kinetic',
            width: 206,
            height: 526
        },
        {
            name: 'reality-control-slider-kinetic-2d',
            width: 526,
            height: 526
        },
        {
            name: 'reality-sensor-graph',
            width: 304,
            height: 304
        },
        {
            name: 'reality-sensor-linear',
            width: 204,
            height: 52
        },
        {
            name: 'reality-sensor-digital',
            width: 52,
            height: 52
        }
    ];

    function pocketInit() {
        pocket = document.querySelector('.pocket');
        palette = document.querySelector('.palette');
        nodeMemoryBar = document.querySelector('.nodeMemoryBar');

        // On touching an element-template, upload to currently visible object
        pocket.addEventListener('pointerdown', function(evt) {
            
            console.log('these dont do anything anymore - uncomment frame.js');
            
            // TODO: reimplement widget frames (uncomment frame.js)
            // if (!evt.target.classList.contains('element-template')) {
            //     return;
            // }
            // var objectIds = Object.keys(realityEditor.gui.ar.draw.visibleObjects);
            // if (objectIds.length !== 1) {
            //     return;
            // }
            // var parentObject = objects[objectIds[0]];
            // var src = evt.target.dataset.src;
            // var width = evt.target.dataset.width;
            // var height = evt.target.dataset.height;
            // var frame = new realityEditor.gui.frame.Frame(src, width, height);
            //
            // var tempMatrix = [];
            // var r = realityEditor.gui.ar.draw.matrix.r;
            //
            // var arUtilities = realityEditor.gui.ar.utilities;
            // arUtilities.multiplyMatrix(realityEditor.gui.ar.draw.visibleObjects[objectIds[0]], globalStates.projectionMatrix, r);
            // arUtilities.multiplyMatrix(rotateX, r, tempMatrix);
            // parentObject.temp = tempMatrix;
            // var matrixTouch = arUtilities.screenCoordinatesToMatrixXY(parentObject, [evt.clientX, evt.clientY]);
            // frame.x = matrixTouch[0];
            // frame.y = matrixTouch[1];
            // realityEditor.gui.frame.create(objectIds[0], frame);
            // pocketHide();
        });

        createPocketUIPalette();
		pocketHide();
    }

    function isPocketWanted() {
        if (pocketShown()) {
            return true;
        }
        if (globalStates.settingsButtonState) {
            return false;
        }
        if (globalStates.editingNode) {
            return false;
        }
        if (inMemoryDeletion) {
            return false;
        }
        return globalStates.guiState === "ui" || globalStates.guiState === "node";
    }

    function onPocketButtonEnter() {
        if (!isPocketWanted()) {
            return;
        }

        if (pocketButtonIsBig()) {
            return;
        }

        if (!globalProgram.objectA) {
            return;
        }

        toggleShown();
    }

    function onPocketButtonUp() {
        if (!isPocketWanted()) {
            return;
        }

        if (pocketButtonIsBig()) {
            return;
        }

        toggleShown();
    }

    function onBigPocketButtonEnter() {
        if (!isPocketWanted()) {
            return;
        }

        if (!pocketButtonIsBig()) {
            return;
        }

        if (realityEditor.gui.memory.memoryCanCreate()) {
            realityEditor.gui.memory.createMemory();
            if (globalStates.guiState === "node") {
                globalStates.drawDotLine = false;
            }
        }

        toggleShown();
    }
    
    function onHalfPocketButtonEnter() {
        // if (!isPocketWanted()) {
        //     return;
        // }
        
        if (!pocketButtonIsHalf()) {
            return;
        }
        
        // TODO: add any side effects here before showing pocket
        
        if (globalStates.editingNode) {
            // var logicNode = getLogicFromNodeKey(globalStates.editingNode);
            var logicNode = realityEditor.getNode(globalStates.editingModeObject, globalStates.editingFrame, globalStates.editingNode);
            if (logicNode) {
                overlayDiv.classList.add('overlayLogicNode');

                var nameText = document.createElement('div');
                nameText.style.position = 'absolute';
                nameText.style.top = '33px';
                nameText.style.width = '100%';
                nameText.style.textAlign = 'center';
                nameText.innerHTML = logicNode.name;
                overlayDiv.innerHTML = '';
                overlayDiv.appendChild(nameText);
                
                overlayDiv.storedLogicNode = logicNode;
            }
        }
        
        if (pocketShown()) {
            // // TODO(ben): is there a better place to do this?
            overlayDiv.innerHTML = '';
            overlayDiv.classList.remove('overlayLogicNode');
        }
        
        toggleShown();
    }

    function pocketButtonIsBig() {
        return realityEditor.gui.menus.getVisibility('bigPocket');
    }
    
    function pocketButtonIsHalf() {
        return realityEditor.gui.menus.getVisibility('halfPocket');
    }

    function toggleShown() {
        if (pocketShown()) {
            pocketHide();
        } else {
            pocketShow();
        }
    }


    function pocketShow() {
        pocket.classList.add('pocketShown');
        realityEditor.gui.menus.buttonOn('main', ['pocket']);
        if (globalStates.guiState === "node") {
            palette.style.display = 'none';
            nodeMemoryBar.style.display = 'block';
        } else {
            palette.style.display = 'block';
            nodeMemoryBar.style.display = 'none';
        }
        setPaletteElementDemo(true);
        realityEditor.gui.memory.nodeMemories.resetEventHandlers();
    }

    function setPaletteElementDemo(value) {
        var paletteElements = document.querySelectorAll('.palette-element');
        for (var i = 0; i < paletteElements.length; i++) {
            var elt = paletteElements[i];
            // TODO(hobinjk): stringify is not required except for legacy reasons
            elt.contentWindow.postMessage(JSON.stringify({demo: value}), '*');
        }
    }

    function pocketHide() {
        pocket.classList.remove('pocketShown');
        realityEditor.gui.menus.buttonOff('main', ['pocket']);
        setPaletteElementDemo(false);
    }

    function pocketShown() {
        return pocket.classList.contains('pocketShown');
    }

    function createPocketUIPalette() {
        for (var i = 0; i<realityElements.length; i++){
            var element = realityElements[i];
            var container = document.createElement('div');
            container.classList.add('element-template');
            container.dataset.src = 'thirdPartyCode/bower_components/' + element.name + '/index.html';

            container.dataset.width = element.width;
            container.dataset.height = element.height;

            var elt = document.createElement('iframe');
            elt.classList.add('palette-element');
            elt.src = 'thirdPartyCode/bower_components/' + element.name + '/index.html?demo=true';

            container.appendChild(elt);
            palette.appendChild(container);

            var paletteElementSize = Math.floor(parseFloat(window.getComputedStyle(container).width)) - 6;

            var scale = Math.min(
                paletteElementSize / element.width,
                paletteElementSize / element.height,
                1
            );

            elt.style.transform = 'scale(' + scale + ')';

            var offsetX = (paletteElementSize - element.width * scale) / 2;
            var offsetY = (paletteElementSize - element.height * scale) / 2;

            elt.style.marginTop = offsetY + 'px';
            elt.style.marginLeft = offsetX + 'px';
        }
    }

    exports.pocketInit = pocketInit;
    exports.pocketShown = pocketShown;
    exports.pocketShow = pocketShow;
    exports.pocketHide = pocketHide;

    exports.onPocketButtonEnter = onPocketButtonEnter;
    exports.onPocketButtonUp = onPocketButtonUp;
    exports.onBigPocketButtonEnter = onBigPocketButtonEnter;
    exports.onHalfPocketButtonEnter = onHalfPocketButtonEnter;

}(realityEditor.gui.pocket));
