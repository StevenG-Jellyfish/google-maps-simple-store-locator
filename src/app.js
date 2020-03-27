/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// Style credit: https://snazzymaps.com/style/1/pale-dawn

const initialLocation = "20176";
const initialZoom = 6;
const clickedZoom = 9;
let markers = [];
const mapStyle = [
  {
    featureType: "administrative",
    elementType: "all",
    stylers: [
      {
        visibility: "on"
      },
      {
        lightness: 33
      }
    ]
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [
      {
        color: "#f2e5d4"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#c5dac6"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels",
    stylers: [
      {
        visibility: "on"
      },
      {
        lightness: 20
      }
    ]
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [
      {
        lightness: 20
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#c5c6c6"
      }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#e4d7c6"
      }
    ]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [
      {
        color: "#fbfaf7"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [
      {
        visibility: "on"
      },
      {
        color: "#acbcc9"
      }
    ]
  }
];

// map handler
let map;

// geocoder handler
let  geocoder;

//let dataSource = 'https://fmc-ag-drupal.k8s.stage.jellyfish.net/us/en/api/retailers';
//let dataSource = './retailers.json';
let dataSource = './retailers-geojson.json';
//let dataSource = './stores.json';


// Escapes HTML characters in a template literal string, to prevent XSS.
// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
function sanitizeHTML(strings) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  let result = strings[0];
  for ( let i = 1; i < arguments.length; i++ ) {
    result += String(arguments[i]).replace(/[&<>'"]/g, char => {
      return entities[char];
    });
    result += strings[i];
  }
  return result;
}


function initMap() {
  geocoder = new google.maps.Geocoder();

  // Create the map. zoom: 2.75,
  map = new google.maps.Map(document.getElementsByClassName("map")[0], {
    center: { lat: 51.5045771, lng: -0.08664599999997336 },
    styles: mapStyle
  });

  setInitialMapCenterByZip(initialLocation);

  // Load the stores GeoJSON onto the map.
  // map.data.loadGeoJson("stores.json");
  // swtich to use getStores();
  stores = getStores();
  console.log('store data: ', stores);
  map.data.loadGeoJson(dataSource);

  // Define the custom marker icons, using the store's "category".
  map.data.setStyle(feature => {
    return {
      icon: {
        //url: `https://www.jellyfish.com/static/icons/jf-launcher-icon-2x.png?v=2.0.0`,
        url: 'https://image.flaticon.com/icons/png/512/1137/1137789.png',
        scaledSize: new google.maps.Size(32, 32),
        animation: google.maps.Animation.DROP,
      }
    };
  });

  const apiKey = "AIzaSyDBL0hwTap6JyImD777wT6fD9-ggo3V3kE";
  const infoWindow = new google.maps.InfoWindow();

  // Show the information for a store when its marker is clicked.
  map.data.addListener("click", event => {
    const category = event.feature.getProperty("category");
    const name = event.feature.getProperty("name");
    const description = event.feature.getProperty("description");
    const address = event.feature.getProperty("address");
    const hours = event.feature.getProperty("hours");
    const phone = event.feature.getProperty("phone");
    const email = event.feature.getProperty("email");
    const image = event.feature.getProperty("image");
    const position = event.feature.getGeometry().get();
    const content = sanitizeHTML`
      <img src="${image}" alt="${name}" />
      <div style="margin-left:220px; margin-bottom:20px;">
        <h2>${name}</h2>
        <p>${description}</p>
        <p>${address}</p>
        <p>
          <strong>Open:</strong> ${hours}<br/>
          <strong>Phone:</strong> ${phone}<br/>
          <strong>Email:</strong> ${email}
        </p>
        <a href="https://www.google.com/maps?saddr=My+Location&daddr=${position}" title="get directions to ${name}" target="_blank"><button>Get Directions</button></a>
      </div>
    `;

    infoWindow.setOptions({
      pixelOffset: new google.maps.Size(0, -30)
    });
    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
    let loc = name.split(",");
    loc = loc[0].replace(" ","-"); 
    scrollLocList(loc);
  }); //click event listener

  // Build and add the search bar
  const card = document.createElement("div");
  const titleBar = document.createElement("div");
  const title = document.createElement("div");
  const container = document.createElement("div");
  const input = document.createElement("input");
  const options = {
    types: ["postal_code"] // changed this from "address" per https://developers.google.com/places/supported_types?hl=es#table3
    ,
    componentRestrictions: { country: "us" }
  };

  card.setAttribute("id", "pac-card");
  title.setAttribute("id", "title");
  title.textContent = "Find the nearest office";
  titleBar.appendChild(title);
  container.setAttribute("id", "pac-container");
  input.setAttribute("id", "pac-input");
  input.setAttribute("type", "text");
  input.setAttribute("placeholder", "Enter a Zip / Postal Code");
  container.appendChild(input);
  card.appendChild(titleBar);
  card.appendChild(container);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  // Make the search bar into a Places Autocomplete search bar and select
  // which detail fields should be returned about the place that
  // the user selects from the suggestions.
  // const autocomplete = new google.maps.places.Autocomplete(input, options);
  const autocomplete = new google.maps.places.Autocomplete(input);

  //autocomplete.setFields(["address_components", "geometry", "name"]);
  //autocomplete.setFields(["address_components"]);
  autocomplete.setFields(['postal_code']);

  // Set the origin point when the user selects an address
  const originMarker = new google.maps.Marker({ map: map });
  console.log('originMarker: ', originMarker);
  originMarker.setVisible(false);
  originLocation = map.getCenter();

  autocomplete.addListener("place_changed", async () => {
    console.log('place_changed: in');
    originMarker.setVisible(false);
    originLocation = map.getCenter();
    console.log('originLocation: ', originLocation);

    const place = autocomplete.getPlace();

    console.log('place: ', place);
    if ( !place.geometry ) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      console.log('place name: ', place.name);
      deleteMarkers();
      setInitialMapCenterByZip(place.name);
      //return;
    }
    else {
    // User entered a place with geometery  
    // Recenter the map to the selected address
      originLocation = place.geometry.location;
      map.setCenter(originLocation);
      map.setZoom(initialZoom);
      //console.log(place);

      originMarker.setPosition(originLocation);
      originMarker.setVisible(true);
    }

    // Use the selected address as the origin to calculate distances
    // to each of the store locations
    // disabled this as the distance calc is a paid library...
    const rankedStores = await calculateDistances(map.data, originLocation);
    showFilteredStoresList(map.data, rankedStores);
    // showStoresList(map.data);
  });
  console.log("markers: ", map);

  // show the listing
  showStoresList(map);
  return;
} //init map



function showFilteredStoresList(data, stores) {
  console.log('showFilteredStoresList: in');
  if (stores.length == 0) {
    console.log('empty stores');
    return;
  }

  let panel = document.createElement('div');
  // If the panel already exists, use it. Else, create it and add to the page.
  if (document.getElementById('panel')) {
    panel = document.getElementById('panel');
    // If panel is already open, close it
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
    }
  } else {
    panel.setAttribute('id', 'panel');
    const body = document.body;
    body.insertBefore(panel, body.childNodes[0]);
  }


  // Clear the previous details
  while (panel.lastChild) {
    panel.removeChild(panel.lastChild);
  }

  stores.forEach((store) => {
    // Add store details with text formatting
    const name = document.createElement('p');
    name.classList.add('place');
    const currentStore = data.getFeatureById(store.storeid);
    name.textContent = currentStore.getProperty('name');
    panel.appendChild(name);
    const distanceText = document.createElement('p');
    distanceText.classList.add('distanceText');
    distanceText.textContent = store.distanceText;
    panel.appendChild(distanceText);
  });

  // Open the panel
  panel.classList.add('open');

  return;
}

async function calculateDistances(data, origin) {
  console.log('calculateDistances: ',data, origin);
  const stores = [];
  const destinations = [];

  // Build parallel arrays for the store IDs and destinations
  data.forEach((store) => {
    const storeNum = store.getProperty('storeid');
    const storeLoc = store.getGeometry().get();

    stores.push(storeNum);
    destinations.push(storeLoc);
  });

  // Retrieve the distances of each store from the origin
  // The returned list will be in the same order as the destinations list
  const service = new google.maps.DistanceMatrixService();
  const getDistanceMatrix =
    (service, parameters) => new Promise((resolve, reject) => {
      service.getDistanceMatrix(parameters, (response, status) => {
        if ( status != google.maps.DistanceMatrixStatus.OK ) {
          reject(response);
        } else {
          const distances = [];
          const results = response.rows[0].elements;
          for ( let j = 0; j < results.length; j++ ) {
            const element = results[j];
            const distanceText = element.distance.text;
            const distanceVal = element.distance.value;
            const distanceObject = {
              storeid: stores[j],
              distanceText: distanceText,
              distanceVal: distanceVal,
            };
            distances.push(distanceObject);
          }

          resolve(distances);
        }
      });
    });

  const distancesList = await getDistanceMatrix(service, {
    origins: [origin],
    destinations: destinations,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
  });

  distancesList.sort((first, second) => {
    return first.distanceVal - second.distanceVal;
  });

  return distancesList;
} // calc distance

/*** Custom Functions */

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  } 
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
//Call this wherever needed to actually handle the display
function setInitialMapCenterByZip(zipCode) {

  console.log("setInitialMapCenterByZip > zipCode: ", zipCode);
  geocoder.geocode( { 'address': zipCode}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //Got result, center the map and put it out there
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });

      markers.push(marker);
      map.setZoom(initialZoom);
      originMarker.setPosition(results[0].geometry.location);
      originMarker.setVisible(true);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
} //setInitialMapCenterByZip


async function getStores(dataSource) {
  console.log("getStores > dataSource: ", dataSource);

  const data = fetch(dataSource)
    .then((response) => {
      return response.json();
    })
    .catch(err => console.log(`Error: ${err}`));

    return data;
} //getStores


async function showStoresList() {

  // console.log("in storelist: 1");
  const storeOBJ = await getStores(dataSource);
  const storeList = storeOBJ.features;
  // console.log("storeList: ", storeList);  
  if( storeList.length > 0 ) {
    let node = document.createElement("UL");   

    for( store in storeList ) {

      //console.log("store: ", store);
      const properties = storeList[store].properties;

      const coords = storeList[store].geometry.coordinates;
      const name = properties.name;
      const description = properties.description;
      const address = properties.address;
      const hours = properties.hours;
      const phone = properties.phone;
      const email = properties.email;
      const image = properties.image;
      //const position = event.feature.getGeometry().get();

      let loc = name.split(",");
      loc = loc[0].replace(" ","-"); 
      //console.log("LOC: ", loc);

      let daContent = document.createElement("li");  ;
      let daText = sanitizeHTML`
          <a href="javascript: moveToLocation(${coords});scrollLocList('${loc}');">
          <h2 id="${loc}">${name}</h2>
          </a>
          <p>${description}</p>
          <p>${address}</p>
          <p>
            <strong>Open:</strong> ${hours}<br/>
            <strong>Phone:</strong> ${phone}<br/>
            <strong>Email:</strong> ${email}
          </p>
      `;
      daContent.innerHTML = daText;    
      node.appendChild(daContent);  
    } // for
    document.getElementById("panel").appendChild(node); 
  } // if
} //showStoreList

function moveToLocation(lng, lat){
  // console.log("coords: ", lng, lat);

  let latlng = new google.maps.LatLng(lat, lng);
  // using global variable:
  map.setCenter(latlng);
  map.setZoom(clickedZoom);
} //moveToLocation

function scrollLocList(loc) {
  //console.log("LOC: ", loc);
  let daClass = 'active-loc';
  let listItems = document.getElementsByClassName(daClass);

  // turn em all off
  for ( i = 0; i < listItems.length; i++ ) {
    listItems[i].classList.remove(daClass);
  }

  //highlight clicked
  let el = document.getElementById(loc);
  let parentEl = el.parentNode.parentNode;
  if ( !parentEl.classList.contains(daClass) ) {
    parentEl.classList.add(daClass);
  }
  el.scrollIntoView();
} //scrollLocList