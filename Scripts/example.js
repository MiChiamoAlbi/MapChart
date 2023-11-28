const map_normal = L.map('map_normal').setView([41.9, 12.49], 5.75);
let layer_normal = L.layerGroup().addTo(map_normal);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_normal);

function cities(listCity){
    for(let i=0; i<Object.keys(listCity).length; i++){
        console.log(listCity[i].city);
        let circle_normal = L.circle([listCity[i].lat, listCity[i].lon], {
            color: 'green',
            fillColor: '#33ff00',
            fillOpacity: 0.5,
            radius: listCity[i].index/30
        }).addTo(layer_normal);
        circle_normal.bindPopup(listCity[i].city + "<br>" + listCity[i].index);

        let circle_logarithmic = L.circle([listCity[i].lat, listCity[i].lon], {
            color: 'green',
            fillColor: '#33ff00',
            fillOpacity: 0.5,
            radius: Math.log(Math.abs(listCity[i].index)) * 2000
        }).addTo(layer_logarithmic);
        circle_logarithmic.bindPopup(listCity[i].city + "<br>" + listCity[i].index);
    }
};

const map_logarithmic = L.map('map_logarithmic').setView([41.9, 12.49], 5.75);
let layer_logarithmic = L.layerGroup().addTo(map_logarithmic);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_logarithmic);

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
                const value = values[index];
                obj[title] = isNaN(value) ? value : +value;
                return obj;
            }, {});
        });
};

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

    fetch('../Assets/files/italia.geojson')
        .then(response => response.json())
        .then(data => {
            //data: https://github.com/openpolis/geojson-italy/blob/master/geojson/limits_IT_regions.geojson
            L.geoJson(data, {style: style}).addTo(map_normal).bringToBack();
            L.geoJson(data, {style: style}).addTo(map_logarithmic).bringToBack();
        })
        .catch(error => {
            console.error(error);
        });
}

let listCity = fetch("../Assets/files/file.csv")
  .then((res) => res.text())
  .then((text) => {
    console.log(CSVtoJSON(text));
    cities(CSVtoJSON(text));
   })
  .catch((e) => console.error(e));

shadow();

//negative section
const map_negative = L.map('map_negative').setView([45.047861900906405, 7.718819447558779], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_negative);
map_negative.scrollWheelZoom.disable();
let circle_green = L.circle([45.01891446031013, 7.7501077093002495], {
    color: 'green',
    fillColor: '#33ff00',
    fillOpacity: 0.5,
    radius: 1000
}).addTo(map_negative);
circle_green.bindPopup('Pecetto Torinese');
let circle_red = L.circle([45.0677551,7.6824892], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 3000
}).addTo(map_negative);
circle_red.bindPopup('TORINO');

//color section
const map_color = L.map('map_color').setView([45.047861900906405, 7.718819447558779], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_color);
map_color.scrollWheelZoom.disable();
let circle_yellow = L.circle([45.0168826, 7.7499491], {
    color: '#FFE156',
    fillColor: '#FFE156',
    fillOpacity: 0.5,
    radius: 404
}).addTo(map_color);
circle_yellow.bindPopup('Pecetto Torinese');
let circle_blue = L.circle([45.039547,7.777125], {
    color: '#0000cc',
    fillColor: '#0000cc',
    fillOpacity: 0.5,
    radius: 838
}).addTo(map_color);
circle_blue.bindPopup('Pino Torinese');

let pin = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+'violet'+'.png',
    //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.marker([45.0677551,7.6824892], {icon: pin}).addTo(map_color);

//layer section - I'm tired, this is the first thing that came in my mind - sucks? I know
const map_layer = L.map('map_layer').setView([45.047861900906405, 7.718819447558779], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_layer);
let layer_town = L.layerGroup().addTo(map_layer);
let layer_city = L.layerGroup().addTo(map_layer);
map_layer.scrollWheelZoom.disable();
let circle_yellow_town = L.circle([45.0168826, 7.7499491], {
    color: '#7ED7C1',
    fillColor: '#7ED7C1',
    fillOpacity: 0.5,
    radius: 404
}).addTo(layer_town);
circle_yellow.bindPopup('Pecetto Torinese');
let circle_blue_town = L.circle([45.039547,7.777125], {
    color: '#F3B664',
    fillColor: '#F3B664',
    fillOpacity: 0.5,
    radius: 838
}).addTo(layer_town);
circle_blue.bindPopup('Pino Torinese');

let pin_city = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+'red'+'.png',
    //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.marker([45.0677551,7.6824892], {icon: pin_city}).addTo(layer_city);

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
});
function handleCheckboxChange() {
    let td = document.querySelectorAll('#td-'+this.id);
    if(this.id == '1'){
        if(this.checked == true){
            layer_city = L.layerGroup().addTo(map_layer);
            L.marker([45.0677551,7.6824892], {icon: pin_city}).addTo(layer_city);
            td.forEach(function(item){
                item.innerHTML = true;
            })
        } else{
            map_layer.removeLayer(layer_city);
            td.forEach(function(item){
                item.textContent = false;
            })
        }
    } else {
        if(this.checked == true){
            layer_town = L.layerGroup().addTo(map_layer);
            circle_yellow_town = L.circle([45.0168826, 7.7499491], {
                color: '#7ED7C1',
                fillColor: '#7ED7C1',
                fillOpacity: 0.5,
                radius: 404
            }).addTo(layer_town);
            circle_yellow.bindPopup('Pecetto Torinese');
            circle_blue_town = L.circle([45.039547,7.777125], {
                color: '#F3B664',
                fillColor: '#F3B664',
                fillOpacity: 0.5,
                radius: 838
            }).addTo(layer_town);
            circle_blue.bindPopup('Pino Torinese');
            td.forEach(function(item){
                item.innerHTML = true;
            })
        } else {
            map_layer.removeLayer(layer_town);
            td.forEach(function(item){
                item.textContent = false;
            })
        }
    }
}