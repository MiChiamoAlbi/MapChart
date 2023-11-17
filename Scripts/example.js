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
        circle_normal.bindPopup(listCity[i].city);

        let circle_logarithmic = L.circle([listCity[i].lat, listCity[i].lon], {
            color: 'green',
            fillColor: '#33ff00',
            fillOpacity: 0.5,
            radius: Math.log(Math.abs(listCity[i].index)) * 2000
        }).addTo(layer_logarithmic);
        circle_logarithmic.bindPopup(listCity[i].city);
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

const map_negative = L.map('map_negative').setView([45.047861900906405, 7.718819447558779], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetmap</a>'
}).addTo(map_negative);

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