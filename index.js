import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet'
import 'leaflet.control.layers.tree'
import 'proj4leaflet'
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css'
import './index.css'

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const BRTA_ATTRIBUTION = 'Kaartgegevens: © <a href="http://www.cbs.nl">CBS</a>, <a href="http://www.kadaster.nl">Kadaster</a>, <a href="http://openstreetmap.org">OpenStreetMap</a><span class="printhide">-auteurs (<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>).</span>'

function getWMTSLayer (layername, attribution) {
  return L.tileLayer(`https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/${layername}/EPSG:28992/{z}/{x}/{y}.png`, { // eslint-disable-line no-undef
    WMTS: false,
    attribution: attribution
  })
}

const brtRegular = getWMTSLayer('standaard', BRTA_ATTRIBUTION)
const brtGrijs = getWMTSLayer('grijs', BRTA_ATTRIBUTION)
const brtPastel = getWMTSLayer('pastel', BRTA_ATTRIBUTION)
const brtWater = getWMTSLayer('water', BRTA_ATTRIBUTION)

// see "Nederlandse richtlijn tiling" https://www.geonovum.nl/uploads/standards/downloads/nederlandse_richtlijn_tiling_-_versie_1.1.pdf
// Resolution (in pixels per meter) for each zoomlevel
var res = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420]

// Projection parameters for RD projection (EPSG:28992):
var map = L.map('mapid', { // eslint-disable-line no-undef
  continuousWorld: true,
  crs: new L.Proj.CRS('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs', { // eslint-disable-line no-undef
    transformation: L.Transformation(-1, -1, 0, 0), // eslint-disable-line no-undef
    resolutions: res,
    origin: [-285401.920, 903401.920],
    bounds: L.bounds([-285401.920, 903401.920], [595401.920, 22598.080]) // eslint-disable-line no-undef
  }),
  layers: [
    brtRegular
  ],
  center: [52.176997, 5.200000],
  zoom: 3
})

var baseLayers = {
  'BRT-Achtergrondkaart [WMTS]': brtRegular,
  'BRT-Achtergrondkaart Grijs [WMTS]': brtGrijs,
  'BRT-Achtergrondkaart Pastel [WMTS]': brtPastel,
  'BRT-Achtergrondkaart Water [WMTS]': brtWater
}

L.control.layers(baseLayers).addTo(map) // eslint-disable-line no-undef

// Leaflet GeoSearch (https://github.com/smeijer/leaflet-geosearch):
const osmProvider = new OpenStreetMapProvider();
const searchControl = new GeoSearchControl({
  provider: osmProvider,
  style: 'bar', // optional: bar|button  - default button
  autoComplete: true, // optional: true|false  - default true
  autoCompleteDelay: 250, // optional: number  - default 250
  searchLabel: 'Zoek woonplaats', // optional: string - default 'Enter address'
  showMarker: false,
});
map.addControl(searchControl);

// Add GeoJSON:
var polygonStyle = {
  "color": "#466bd1",
  "weight": 3,
  "opacity": 0.65
};

fetch('https://victorious-beach-0b1554903.azurestaticapps.net/api/parcels')
  .then(response => response.json())
  .then(data => {
    var fields = 
    L.geoJSON(data, {
      style: polygonStyle
    })
    .on('click', function(e){
      console.log(e.sourceTarget.feature);
      })
    .addTo(map);
    
    map.fitBounds(fields.getBounds());
  });
