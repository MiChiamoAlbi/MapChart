# MapChart
I needed a tool that would allow me to represent data on a map in a deeper level than the tools made available by Google Sheet and Excel. The goal was to have one that, even if not easy to use (at the moment), provided a map that could be read immediately and easily understandable by everyone. Future implementation require a legend to let understand visualy the dimension of the index relative to the dimension of the circle.
The problem was divided into two sub-programs and so pages: one to find the coordinates for each city in the inserted file, aka geocoding, and the other to create the map per se.

Geocoding: [Nominatim API](https://nominatim.org) - MapChart: [Leaflet.js](https://leafletjs.com)<br> 
ExportPNG: [leaflet-easyPrint](https://github.com/rowanwins/leaflet-easyPrint) - Colored pins: [leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers)

##  History and future implementations
### Global

- [x] google indexing
    - [ ] sitemap (?)
    - [ ] robots.txt (?)

- [ ] homepage review
- [ ] multilanguage
    - [x] example page
- [ ] reorganize code to be readable
- [ ] iframe-able page

### Map chart generator

- [ ] legend

- [x] toggle layers
- [ ] embeded editor

- [x] plot pin - from JSON file.index: "pin"
- [x] choose color - from JSON file.color: "#hex"

- [x] option menu --> arrow bottom
    - [x] normal/logaritmic scale
    - [x] input for option scale

### Geocoder

- [ ] manage errors