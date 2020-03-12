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

let map;

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
  // Create the map.
  map = new google.maps.Map(document.getElementsByClassName("map")[0], {
    zoom: 2.75,
    center: { lat: 51.5045771, lng: -0.08664599999997336 },
    styles: mapStyle
  });

  // Load the stores GeoJSON onto the map.
  map.data.loadGeoJson("stores.json");

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
      <!-- 
      logo:
      <img style="float:left; width:200px; margin-top:30px" src="img/logo.png"> 
      -->
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
        <!-- 
        streetview:
        <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
        -->
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
    types: ["address"]
    //,
    //componentRestrictions: { country: "us" }
  };

  card.setAttribute("id", "pac-card");
  title.setAttribute("id", "title");
  title.textContent = "Find the nearest office";
  titleBar.appendChild(title);
  container.setAttribute("id", "pac-container");
  input.setAttribute("id", "pac-input");
  input.setAttribute("type", "text");
  input.setAttribute("placeholder", "Enter an address");
  container.appendChild(input);
  card.appendChild(titleBar);
  card.appendChild(container);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  // Make the search bar into a Places Autocomplete search bar and select
  // which detail fields should be returned about the place that
  // the user selects from the suggestions.
  const autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.setFields(["address_components", "geometry", "name"]);

  // Set the origin point when the user selects an address
  const originMarker = new google.maps.Marker({ map: map });
  originMarker.setVisible(false);
  let originLocation = map.getCenter();

  autocomplete.addListener("place_changed", async () => {
    originMarker.setVisible(false);
    originLocation = map.getCenter();
    const place = autocomplete.getPlace();

    if ( !place.geometry ) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No address available for input: '" + place.name + "'");
      return;
    }

    // Recenter the map to the selected address
    originLocation = place.geometry.location;
    map.setCenter(originLocation);
    map.setZoom(9);
    //console.log(place);

    originMarker.setPosition(originLocation);
    originMarker.setVisible(true);

    // Use the selected address as the origin to calculate distances
    // to each of the store locations
    // disabled this as the distance calc is a paid library...
    // const rankedStores = await calculateDistances(map.data, originLocation);
    // showStoresList(map.data, rankedStores);
    //showStoresList(map.data);
  });
  //console.log("markers: ", map);

  showStoresList(map);
  return;
} //init map

async function calculateDistances(data, origin) {
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


function getStores() {
  const data = fetch('./stores.json')
    .then((response) => {
      return response.json();
    });

    return data;
}
async function showStoresList() {

  // console.log("in storelist: 1");
  const storeOBJ = await getStores();
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
  map.setZoom(8);
}
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
}