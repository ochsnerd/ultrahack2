// fat L
var model_ticket = '77ed2f267756a8d0bc9dfa1a9cf3ba4e6bcd2989113069c6ac7ce91a4cb261c84d7b79d59f9da5fd3125d000d1469b108f43b0246fa5bea4d9b5ace1ff26af124c1d63e7572292a62d5ec0e6ba23e79c9f677cbb8bffa5e6124b4b6ad5d71f7baa5b51364d60eaeace4cb812b399515bd2011b51eb6f-acdcf4a51db17b9582fb3b9c0fbe750f'

// empty?
var model_ticket = 'a81c2f86e117aaf773f6e24469ccbacd75a58ea4fb7bc45f4ffd5c5fd69a7e8c83d54471c883d63d3053df3c501fe255ecd84d7c4cd66f3afda6d2856c457078bfb9de3549e77530466372006b76a87b01bd65489c060a05c6d4fdd5ab3c6e47288370194885b9274c3b6539be7231a292de7f10e1e0d6d30a71a8c2211cda01d5dbff08b153ff-6ddedbf76c6356e57546842d54053ff4'

// container for the viewer, typically this is a div
var _container = document.getElementById('sdv-container');
// viewer settings
var _viewerSettings = {
    // container to use
    container: _container,
    // when creating the viewer, we want to get back an API v2 object
    api: {
        version: 2
    },
    // ticket for a ShapeDiver model
    ticket: model_ticket,
    modelViewUrl: 'eu-central-1'
};

// create the viewer, get back an API v2 object
var api = new SDVApp.ParametricViewer(_viewerSettings);


var viewerInit = false;

// For auto parameter html input divs
var parameters;

api.scene.addEventListener(api.scene.EVENTTYPE.VISIBILITY_ON, function() {
    if (!viewerInit) {
        // Automatically create html input elements for all parameters
        var globalDiv = document.getElementById("parameters");
        parameters = api.parameters.get();
        parameters.data.sort(function(a, b) {
            return a.order - b.order;
        });

        console.log("parameters");
        console.log(parameters);

        for (let i = 0; i < parameters.data.length; i++) {
            let paramInput = null;
            let paramDiv = document.createElement("div");
            let param = parameters.data[i];
            let label = document.createElement("label");
            label.setAttribute("for", param.id);
            label.innerHTML = param.name;
            if (param.type == "Int" || param.type == "Float" || param.type == "Even" || param.type == "Odd") {
                paramInput = document.createElement("input");
                paramInput.setAttribute("id", param.id);
                paramInput.setAttribute("type", "range");
                paramInput.setAttribute("min", param.min);
                paramInput.setAttribute("max", param.max);
                paramInput.setAttribute("value", param.value);
                if (param.type == "Int") paramInput.setAttribute("step", 1);
                else if (param.type == "Even" || param.type == "Odd") paramInput.setAttribute("step", 2);
                else paramInput.setAttribute("step", 1 / Math.pow(10, param.decimalplaces));
                paramInput.onchange = function() {
                    api.parameters.updateAsync({
                        id: param.id,
                        value: this.value
                  });
                };
            } else if (param.type == "Bool") {
                paramInput = document.createElement("input");
                paramInput.setAttribute("id", param.id);
                paramInput.setAttribute("type", "checkbox");
                paramInput.setAttribute("checked", param.value);
                paramInput.onchange = function() {
                    console.log(this);
                    api.parameters.updateAsync({
                        id: param.id,
                        value: this.checked
                  });
                };
            } else if (param.type == "String") {
                paramInput = document.createElement("input");
                paramInput.setAttribute("id", param.id);
                paramInput.setAttribute("type", "text");
                paramInput.setAttribute("value", param.value);
                paramInput.onchange = function() {
                    api.parameters.updateAsync({
                        id: param.id,
                        value: this.value
                    });
                };
            } else if (param.type == "Color") {
                paramInput = document.createElement("input");
                paramInput.setAttribute("id", param.id);
                paramInput.setAttribute("type", "color");
                paramInput.setAttribute("value", param.value);
                paramInput.onchange = function() {
                    api.parameters.updateAsync({
                        id: param.id,
                        value: this.value
                  });
                };
            } else if (param.type == "StringList") {
                paramInput = document.createElement("select");
                paramInput.setAttribute("id", param.id);
                for (let j = 0; j < param.choices.length; j++) {
                    let option = document.createElement("option");
                    option.setAttribute("value", j);
                    option.setAttribute("name", param.choices[j]);
                    option.innerHTML = param.choices[j];
                    if (param.value == j) option.setAttribute("selected", "");
                    paramInput.appendChild(option);
                }
                paramInput.onchange = function() {
                    api.parameters.updateAsync({
                        id: param.id,
                        value: this.value
                    });
                };
            }
            else if (param.type == "File") {
                console.log("file param, do nothing");
                continue;
            }

            if (param.hidden) paramDiv.setAttribute("hidden", "");
            paramDiv.appendChild(label);
            paramDiv.appendChild(paramInput);
            globalDiv.appendChild(paramDiv);
        }
        
        var exports = api.exports.get();
        console.log("exports");
        console.log(exports);
        // there's a problem here, my browser dies when this is executed
        // for (let i = 0; i < exports.data.length; i++) {
        //     let exportAsset = exports.data[i];
        //     let exportDiv = document.createElement("div");
        //     let exportInput = document.createElement("input");
        //     exportInput.setAttribute("id", exportAsset.id);
        //     exportInput.setAttribute("type", "button");
        //     exportInput.setAttribute("name", exportAsset.name);
        //     exportInput.setAttribute("value", exportAsset.name);
        //     exportInput.onclick = function() {
        //         api.exports.requestAsync({
        //             id: this.id
        //         }).then(
        //             function(response) {
        //                 let link = response.data.content[0].href;
        //                 window.location = link;
        //             }
        //         );
        //     };
        //     exportDiv.appendChild(exportInput);
        //     globalDiv.appendChild(exportDiv);
        // }



        // For selectable points
        api.scene.updateInteractionGroups(sphereGroup);
        api.scene.updateInteractionGroups(headGroup);
        var assets = api.scene.get(null, "CommPlugin_1");
        
        console.log(assets)
        
        var updateObjects = [];
        for (let assetnum in assets.data) {
            var asset = assets.data[assetnum];
            let updateObject = {};
            if (asset.name.includes("Sphere_")) {
                updateObject = {
            id: asset.id,
                    duration: 0,
                    interactionGroup: sphereGroup.id,
                };
            } else if (asset.name == "Head") {
                updateObject = {
                    id: asset.id,
                    duration: 0,
                    interactionGroup: headGroup.id
                };
            } else {
                updateObject = {
                    id: asset.id,
                    duration: 0
                };
            }
            updateObjects.push(updateObject);
            
        }
        api.scene.updatePersistentAsync(updateObjects, 'CommPlugin_1');
        api.scene.addEventListener(api.scene.EVENTTYPE.DRAG_END, dragCallback);
        api.scene.addEventListener(api.scene.EVENTTYPE.SELECT_ON, addPoint);
        
        console.log("Done init")
        viewerInit = true;
    }
});

// POINTS ---------------------------------------------------------------------------------------
// defining effects for hoverable and selectable objects
var highlightEffect = {
  active: {
    name: 'colorHighlight',
    options: {
      color: [255, 255, 255]
    }
  }
};

// defining a group of hoverable and selectable objects
var sphereGroup = {
  id: "spheres",
  draggable: true,
  dragEffect: highlightEffect,
  hoverable: true,
  hoverEffect: highlightEffect
};
var headGroup = {
  id: "Head",
  selectable: true
};

var selectedSphere;
var hoverPos;
var points = [];
var pickPoint = {};

var addPoint = function(event) {
    pickPoint = event.selectPos;
    console.log("clicked on" + pickPoint)

    if (points.length < 3) {
        points.push([pickPoint.x, pickPoint.y, pickPoint.z]);
        console.log(points);
        api.parameters.updateAsync({
            name: "Points",
            value: JSON.stringify({
                'points': points
            })
        });
        if (points.length == 1) {
            document.getElementById("info").innerHTML += "<br>Drag existing points to update their position on the mesh...";
        }
        if (points.length == 3) {
            document.getElementById("info").innerHTML += "<br>Maximum number of points added.";
        }
    }
    api.scene.updateSelected(null,api.scene.getSelected());
};

var dragCallback = function(event) {
  // find which sphere was selected
  let sphereID = event.scenePath.split(".")[1];
  let sphereAsset = api.scene.get({
    id: sphereID
  }, "CommPlugin_1");
  selectedSphere = sphereAsset.data[0].name.split("_")[1];
  let newPos = event.dragPosAbs;
  points[selectedSphere][0] = newPos.x;
  points[selectedSphere][1] = newPos.y;
  points[selectedSphere][2] = newPos.z;
  api.parameters.updateAsync({
    name: "Points",
    value: JSON.stringify({
      'points': points
    })
  });
};

// function exportFile() {
//   api.exports.requestAsync({name: "Export"}).then(
//     function(response){
//       let link = response.data.content[0].href;
//       console.log("Use this link to download the file: " + link);
//       window.location=link;
//     }
//   );
// }

function exportFile() {
    api.exports.requestAsync({name: "SDExportDownload"}).then(
        function(response){
            let link = response.data.content[0].href;
            console.log("Use this link to download the file: " + link);
            window.location=link;
        }
    );
};

document.getElementById("import").onchange = function(res) {
    let file = document.getElementById("import").files[0];
    api.parameters.updateAsync({
        name: "SDGeometryInput",
        value: file
    }).then(
        function(response) {
            alert("File successfully uploaded", response);
        }
    );
};





// from here: test2 ------------------------------------------------------------------------

// // defining effects for hoverable and selectable objects
// var highlightEffect = {
//     active: {
//         name: 'colorHighlight',
//         options: {
//             color: [255, 255, 255]
//         }
//     }
// };


// // defining a group of hoverable and selectable objects
// var sphereGroup = {
//     id: "spheres",
//     draggable: true,
//     dragEffect: highlightEffect,
//     hoverable: true,
//     hoverEffect: highlightEffect
// };
// var headGroup = {
//     id: "Head",
//           selectable: true
// };
      
// var viewerInit = false;
// var selectedSphere;
// var hoverPos;
// api.scene.addEventListener(api.scene.EVENTTYPE.VISIBILITY_ON, function() {
//     if (!viewerInit) {
//         api.scene.updateInteractionGroups(sphereGroup);
//         api.scene.updateInteractionGroups(headGroup);
//         var assets = api.scene.get(null, "CommPlugin_1");
//         var updateObjects = [];
//         for (let assetnum in assets.data) {
//             var asset = assets.data[assetnum];
//             let updateObject = {};
//             if (asset.name.includes("Sphere_")) {
//                 updateObject = {
//                     id: asset.id,
//                     duration: 0,
//                     interactionGroup: sphereGroup.id,
//                 };
//             } else if (asset.name == "Head") {
//                 updateObject = {
//                     id: asset.id,
//                     duration: 0,
//                     interactionGroup: headGroup.id
//                 };
//             } else {
//                 updateObject = {
//                     id: asset.id,
//                     duration: 0
//                 };
//             }
//             updateObjects.push(updateObject);
            
//         }
//         api.scene.updatePersistentAsync(updateObjects, 'CommPlugin_1');
//         api.scene.addEventListener(api.scene.EVENTTYPE.DRAG_END, dragCallback);
//         api.scene.addEventListener(api.scene.EVENTTYPE.SELECT_ON, addPoint);
//     }
// });

// var pickPoint = {};
// var points = [];

// //var updateHoverPos = function(event) {
// //	hoverPos=event.hoverPos;
// //}

// var dragCallback = function(event) {
//     // find which sphere was selected
//     let sphereID = event.scenePath.split(".")[1];
//     let sphereAsset = api.scene.get({
//         id: sphereID
//     }, "CommPlugin_1");
//     selectedSphere = sphereAsset.data[0].name.split("_")[1];
//     let newPos = event.dragPosAbs;
//     points[selectedSphere][0] = newPos.x;
//     points[selectedSphere][1] = newPos.y;
//     points[selectedSphere][2] = newPos.z;
//     api.parameters.updateAsync({
//         name: "Points",
//         value: JSON.stringify({
//             'points': points
//         })
//     });
//     api.scene.updateSelected(null,api.scene.getSelected());
// };

// var addPoint = function(event) {
//     console.log("Clicked")
//     console.log(api.parameters.get());
//     pickPoint = event.selectPos;
//     // if we have less than max points: add new one
//     if (points.length < max_points) {
//         points.push([pickPoint.x, pickPoint.y, pickPoint.z]);
//         console.log(points);
//         api.parameters.updateAsync({
//             name: "Points",
//             value: JSON.stringify({
//                 'points': points
//             })
//         });
//     }
//     // when the first point is placed add tooltip
//     if (points.length == 1) {
//         document.getElementById("info").innerHTML += "<br>Drag existing points to update their position on the mesh...";
//     }
//     // notify when max number of points is reached
//     if (points.length == 3) {
//         document.getElementById("info").innerHTML += "<br>Maximum number of points added.";
//     }
 
//     api.scene.updateSelected(null,api.scene.getSelected());
// };


// function exportFile() {
//     api.exports.requestAsync({name: "Export"}).then(
//         function(response){
//             let link = response.data.content[0].href;
//             console.log("Use this link to download the file: " + link);
//             window.location=link;
//         }
//     );
// }

// document.getElementById("image-file").onchange = function(res) {
//     let file = document.getElementById("image-file").files[0];
//     api.parameters.updateAsync({
//         name: "Head",
//         value: file
//     }).then(
//         function(response) {
//             alert("File successfully uploaded", response);
//         }
//     );
// };


// var resetPoints = function() {
//     console.log("deleting points")
//     points = [];
//     document.getElementById("info").innerHTML = "Click on the mesh to pick a point on it...";
//     api.parameters.updateAsync({
//         name: "Points",
//         value: JSON.stringify({
//             'points': [[0,0,0],[0,0,0],[0,0,0]]
//         })
//     });
//     api.scene.updateSelected(null,api.scene.getSelected());
// };

