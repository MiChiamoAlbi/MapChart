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

/*async function loopCity(listCity){
    var progress = document.querySelector('.progress');
    progress.classList.remove("visually-hidden");
    var progressBar = document.querySelector('.progress-bar');
    var width = 0;
    for(let i=0; i<Object.keys(listCity).length; i++){
        progressBar.setAttribute('style', 'width: ' + width + '%');
        console.log(listCity[i].city + " - " + typeof listCity[i].city);
        if (typeof listCity[i].city !== 'undefined' && listCity[i].city != 0){
            $.get(location.protocol + '//nominatim.openstreetmap.org/search?format=json&q='+ listCity[i].city, function(data){
                listCity[i].lat = isNaN(data[0].lat) ? data[0].lat : +data[0].lat;
                listCity[i].lon = isNaN(data[0].lon) ? data[0].lon : +data[0].lon;
            });
            await new Promise(r => setTimeout(r, 2000));
        }
        width = (i/Object.keys(listCity).length)*100;
    };
    await new Promise(r => setTimeout(r, 500));
    progress.classList.add("visually-hidden");
    return okay;
};*/

async function loopCity(listCity){
    let progress = document.querySelector('.progress');
    progress.classList.remove("visually-hidden");
    let progressBar = document.querySelector('.progress-bar');
    let width = 0;
    let checkbox = document.getElementById('selection');
    checkbox.disabled  = true;

    for(let i=0; i<Object.keys(listCity).length; i++){
        progressBar.setAttribute('style', 'width: ' + width + '%');
        //console.log(listCity[i].city + " - " + typeof listCity[i].city + " - " + listCity[i].lat);

        if (listCity[i].city !== undefined && listCity[i].city != 0 && listCity[i].lat == undefined){
            let listCityObject = await $.get(location.protocol + '//nominatim.openstreetmap.org/search?format=json&q='+ listCity[i].city, function(data){
                return data;
            });
            if(listCityObject.length>1 && checkbox.checked){
                document.querySelector('.container').classList.remove("visually-hidden");               
                document.querySelector('#main').classList.add("visually-hidden");
                document.querySelector('body').classList.remove("overflow-hidden");

                await generateListCity(listCityObject);
                await new Promise(resolve => {
                    divCityList.addEventListener("click", function(event) {
                        let selectedCity = event.target;
                        let cityIndex = selectedCity.getAttribute('data-city');
    
                        listCity[i].lat = isNaN(listCityObject[cityIndex].lat) ? listCityObject[cityIndex].lat : +listCityObject[cityIndex].lat;
                        listCity[i].lon = isNaN(listCityObject[cityIndex].lon) ? listCityObject[cityIndex].lon : +listCityObject[cityIndex].lon;

                        document.querySelector('.container').classList.add("visually-hidden");               
                        document.querySelector('#main').classList.remove("visually-hidden");
                        document.querySelector('body').classList.add("overflow-hidden");
                        resolve();
                    });
                });
            } else {
                listCity[i].lat = isNaN(listCityObject[0].lat) ? listCityObject[0].lat : +listCityObject[0].lat;
                listCity[i].lon = isNaN(listCityObject[0].lon) ? listCityObject[0].lon : +listCityObject[0].lon;
            };
            await new Promise(r => setTimeout(r, 2000));
        };

        width = ((i+1)/Object.keys(listCity).length)*100;
    };

    //await new Promise(r => setTimeout(r, 500));
    progress.classList.add("visually-hidden");
    return listCity;
};

const CSVtoJSON = (data, delimiter = ',') => {
    const titles = data.slice(0, data.indexOf('\n')).split(delimiter).map(title => title.trim());
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

async function JSONtoCSV(listCity){
    const items = listCity;
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(items[0]);
    const csv = [
      header.join(';'),
      ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    
    return csv.replace(/['"]/g, '');
};

function save(new_file){
    let blob = new Blob([new_file], {type: "text/plain"});

    let link = document.createElement("a");
    link.innerText = "Save";
    link.href = window.URL.createObjectURL(blob);
    link.download = "file.csv";
    link.className= "btn btn-outline-warning mt-3 position-relative start-50 translate-middle-x";

    let div = document.getElementById("buttons");
    div.appendChild(link);    
};

async function cascade(contents){
    let delimiter = ',';
    let chooseDelimiter = document.getElementById('delimiter');
    delimiter = chooseDelimiter.value;
    chooseDelimiter.disabled = true;
    let listCity = CSVtoJSON(contents, delimiter);
    console.log(listCity);
    listCity = await loopCity(listCity);
    const new_file = await JSONtoCSV(listCity);
    save(new_file);
};

let divCityList = document.getElementById("citylist");
async function generateListCity(listCityObject){
    divCityList.innerHTML = "";
    for (let i = 0; i < listCityObject.length; i++) {
        let rowDiv = document.createElement("tr");

        let cityIndex = document.createElement("td");
        cityIndex.innerText = i+1;
        cityIndex.setAttribute('scope', 'row');
        cityIndex.setAttribute("data-city", i);
        rowDiv.appendChild(cityIndex);

        let cityLink = document.createElement("td");
        cityLink.innerText = listCityObject[i].display_name;
        cityLink.classList.add("link-primary");
        cityLink.setAttribute("data-city", i);
        rowDiv.appendChild(cityLink);

        let cityClass = document.createElement("td");
        cityClass.innerText = listCityObject[i].addresstype;
        cityClass.setAttribute("data-city", i);
        rowDiv.appendChild(cityClass);

        let latitude = document.createElement("td");
        latitude.innerText = listCityObject[i].lat;
        latitude.setAttribute("data-city", i);
        rowDiv.appendChild(latitude);

        let longitude = document.createElement("td");
        longitude.innerText = listCityObject[i].lon;
        longitude.setAttribute("data-city", i);
        rowDiv.appendChild(longitude);

        divCityList.appendChild(rowDiv);
    };
};

/*
$.get(location.protocol + '//nominatim.openstreetmap.org/search?format=json&q='+city, function(data){
    console.log(data);
});
*/