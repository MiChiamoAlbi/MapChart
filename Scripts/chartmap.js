const map = L.map('map').setView([45.1677551, 7.7824892], 8);
let layer = L.layerGroup().addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
    listCity = CSVtoJSON(contents)
    //console.log(listCity);
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
    return data
        .slice(data.indexOf('\n')+1)
        .split('\n')
        .map(v => {
            const values = v.replace("\r", "").split(delimiter);
            return titles.reduce((obj, title, index) => {
                const value = values[index] === '' ? undefined : values[index];
                obj[title] = isNaN(value) ? value : +value;
                return obj;
            }, {});
        });
};

async function cities(listCity){
    let radius = 0;

    for(let i=0; i<Object.keys(listCity).length; i++){
        //console.log(listCity[i].city);

        if(logaritm){
            radius = Math.log(Math.abs(listCity[i].index)) * correction_index * 10;
        } else {
            radius = listCity[i].index * correction_index;
        }

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

        if(typeof(listCity[i].index) === 'number'){
            let circle = L.circle([listCity[i].lat, listCity[i].lon], {
                color: borderColor,
                fillColor: fillColor,
                fillOpacity: 0.5,
                radius: radius
            }).addTo(layer);
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
            let marker = L.marker([listCity[i].lat, listCity[i].lon], {icon: coloredIcon}).addTo(layer);
            marker.bindPopup(listCity[i].city);
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
    map.removeLayer(layer);
    layer = L.layerGroup().addTo(map);
    cities(listCity);
});

let correction_index_element = document.getElementById("scaleindex");
let correction_index = 100;
correction_index_element.addEventListener("input", function(){
    correction_index = correction_index_element.value;
    map.removeLayer(layer);
    layer = L.layerGroup().addTo(map);
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