const map = L.map('map').setView([45.1677551, 7.7824892], 8);
//let layer = L.layerGroup().addTo(map);
let layers = [];

let baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
baseLayer._leaflet_id = 'map';

map.attributionControl.addAttribution('<a href="https://github.com/MiChiamoAlbi" target="_blank">MiChiamoAlbi</a>').addTo(map);

let map_scale = document.getElementById('map_scale');
let scale = L.control.scale().addTo(map);
map_scale.addEventListener("change", function(){
    if(this.checked){
        scale = L.control.scale().addTo(map);
    } else {
        scale.remove(map);
    }
})

//https://github.com/rowanwins/leaflet-easyPrint
L.easyPrint({
	title: 'Print',
	position: 'topleft',
	sizeModes: ['Current','A4Portrait', 'A4Landscape'],
    exportOnly: true,
    hideControlContainer: false,
    hideClasses:['leaflet-control-zoom', 'leaflet-control-easyPrint-button-export']
}).addTo(map);

function createLayers(listCity){
    let  nameLeyers = getUniqueLayers(listCity);
    if (nameLeyers.length){
        for(let i = 0; i < nameLeyers.length; i++){
            layers[nameLeyers[i]] = L.layerGroup().addTo(map);
        }
    } else {
        layers['undefined']= L.layerGroup().addTo(map);
    }
}

function getUniqueLayers(items, property ='layer') {
    const uniqueValues = new Set();
    for (const item of items) {
      if (item.hasOwnProperty(property)) {
        uniqueValues.add(String(item[property]));
      }
    }
    return Array.from(uniqueValues);
}

function readCSV(fileCsv) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        cascade(contents);
    }; 
    reader.readAsText(fileCsv);
}

fileInput.addEventListener('change', function(event) {
    const fileCsv = event.target.files[0];
    readCSV(fileCsv);
});

let listCity = [];
async function cascade(contents){
    listCity = CSVtoJSON(contents);
    console.log(listCity);
    createLayers(listCity);
    //shadow();
    await cities(listCity);
}

function CSVtoJSON (data) {
    let titles = data.slice(0, data.indexOf('\n'));
    let delimiter;
    if(titles.includes(';')){
        delimiter = ';';
    } else {
        delimiter = ',';
    }
    titles = titles.split(delimiter).map(title => title.trim());
    let objectList= data
        .slice(data.indexOf('\n')+1)
        .split('\n')
        .map(v => {
            const values = v.replace("\r", "").split(delimiter);
            return titles.reduce((obj, title, index) => {
                const value = values[index] === '' ? undefined : values[index];
                if (value === 'true') {
                    obj[title] = true;
                } else if (value === 'false') {
                    obj[title] = false;
                } else {
                    obj[title] = isNaN(value) ? value : +value;
                }
                return obj;
            }, {});
        });
    if(!Object.keys(objectList[0]).toString().includes('visibility')){
        objectList.forEach((item, i) => {
            objectList[i]={...item,visibility:true};
        });
    } else {
        objectList.forEach((item, i) => {
            if(objectList[i].visibility === undefined){
                objectList[i]={...item,visibility:true};
            }
        });
    }
    if(objectList[objectList.length-1] && objectList[objectList.length-1].value === undefined){
        objectList.pop();
    }
    return objectList
};

async function cities(listCity){
    let radius = 0;

    for(let i=0; i<Object.keys(listCity).length; i++){
        //console.log(listCity[i].city);

        //set radius - switch normal or logaritmic scale
        if(logaritm){
            radius = Math.log(Math.abs(listCity[i].index)) * correction_index * 10;
        } else {
            radius = listCity[i].index * correction_index;
        }


        //set color
        let fillColor;
        let borderColor;

        try{
            if(listCity[i].color != "" && listCity[i].color[0] === "#"){ //think about delete # condition
                borderColor = reduceBrightness(listCity[i].color); 
                fillColor = listCity[i].color;
            } else {
                if(listCity[i].index >= 0){
                    borderColor = 'green';
                    fillColor = '#33ff00';
                } else {
                    borderColor = 'red';
                    fillColor = '#f03';
                };
            }
        } catch {
            if(listCity[i].index >= 0){
                borderColor = 'green';
                fillColor = '#33ff00';
            } else {
                borderColor = 'red';
                fillColor = '#f03';
            };
        }

        //set layer
        let selectedLayer;
        if(Object.keys(layers).length){
            selectedLayer = layers[String(listCity[i].layer)];
        } else {
            selectedLayer = layers['undefined'];
        }

        //plot the circle or the ping
        if(listCity[i].visibility === true){
            if(typeof(listCity[i].index) === 'number'){
                let circle = L.circle([listCity[i].lat, listCity[i].lon], {
                    color: borderColor,
                    fillColor: fillColor,
                    fillOpacity: 0.5,
                    radius: radius
                }).addTo(selectedLayer);
                circle.bindPopup(listCity[i].city + "<br>" + listCity[i].index);
            }
            else if(listCity[i].index === 'x'){
                let inputColor = 'gold';
                let variations = ['blue', 'gold', 'red', 'green', 'orange', 'yellow', 'violet', 'gray', 'black'];
                if(listCity[i].color != undefined){
                    if (variations.includes(listCity[i].color.toLowerCase())){
                        inputColor = listCity[i].color.toLowerCase();
                    }
                }
                //https://github.com/pointhi/leaflet-color-markers
                let coloredIcon = new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+inputColor+'.png',
                    //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [16, 26],//[25, 41],
                    iconAnchor: [8, 26],  //[12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                let marker = L.marker([listCity[i].lat, listCity[i].lon], {icon: coloredIcon}).addTo(selectedLayer);
                marker.bindPopup(listCity[i].city);
            }
        }
    }
};

//not used at the moment
function shadow(){
    function style(feature) {
        return {
            fillColor: '#FED976', //'#8D99AE',
            weight: 2,
            opacity: 1,
            color: '#FED976',
            dashArray: '0',
            fillOpacity: 0.3
        };
}

fetch('../Assets/files/piemonte.geojson')
    .then(response => response.json())
    .then(data => {
        //data from https://github.com/openpolis/geojson-italy/blob/master/geojson/limits_IT_regions.geojson
        L.geoJson(data, {style: style}).addTo(map);
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
}

let logaritm = false;
const rotation = document.getElementById("logaritm");
rotation.addEventListener("change", function() {
    if (this.checked) {
        logaritm = true;
    } else {
        logaritm = false;
    }
    map.eachLayer(function (layer) {
        if(layer._leaflet_id!=='map'){
            map.removeLayer(layer);
        }
    });
    createLayers(listCity);
    cities(listCity);
});

let correction_index_element = document.getElementById("scaleindex");
let correction_index = 100;
correction_index_element.addEventListener("input", function(){
    correction_index = correction_index_element.value;
    map.eachLayer(function (layer) {
        if(layer._leaflet_id!=='map'){
            map.removeLayer(layer);
        }
    });
    createLayers(listCity);
    cities(listCity);
});

function reduceBrightness(colorHex) {
    colorHex = colorHex.replace("#", "");
  
    var rgb = [];
    for (var i = 0; i < 3; i++) {
      rgb[i] = parseInt(colorHex.substr(i * 2, 2), 16);
    }
  
    for (var i = 0; i < 3; i++) {
      rgb[i] = Math.round(rgb[i] * 0.9);
    }

    var newColorHex = '#';
    for (var i = 0; i < 3; i++) {
      var componentHex = rgb[i].toString(16);
      if (componentHex.length < 2) {
        componentHex = '0' + componentHex;
      }
      newColorHex += componentHex;
    }
  
    return newColorHex;
}

//layers - not optimazed at all, find a better way where it's removed/added only the layer checked

/*
<div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="1" checked>
    <label class="form-check-label" for="1">Prova di input</label>
</div> 
*/

let openLayer = document.getElementById("open-layer");
let listLayer = document.querySelector('#list-layer');
openLayer.addEventListener("click", function(){
    openLayer.classList.add("visually-hidden");
    let containerLayer = document.getElementById("container-layer");
    containerLayer.classList.remove("visually-hidden");
    if(!listLayer.children.length){
        console.log();
        for(let i=0; i<Object.keys(layers).length; i++){
            let checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.id = `${i}`;
            checkbox.checked = true;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `${i}`;
            label.textContent = `${Object.keys(layers)[i]}`;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);

            listLayer.appendChild(checkboxDiv);
        }
    }
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    function handleCheckboxChange() {
        editLayer(this.id, this.checked);
    }
})
let closeLayer = document.getElementById("close-layer");
closeLayer.addEventListener("click", function(){
    openLayer.classList.remove("visually-hidden");
    let containerLayer = document.getElementById("container-layer");
    containerLayer.classList.add("visually-hidden");
})
function editLayer(id, status){
    for(let i=0;i<listCity.length;i++){
        if(listCity[i].layer == Object.keys(layers)[id] || Object.keys(layers)[id] == 'undefined' && listCity[i].layer == undefined){
            listCity[i].visibility = status;
        }
    }
    map.eachLayer(function (layer) {
        if(layer._leaflet_id!=='map'){
            map.removeLayer(layer);
        }
    });
    createLayers(listCity);
    cities(listCity);
}