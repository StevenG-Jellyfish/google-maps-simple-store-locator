
  // build the list
  function initList() {
    const listContent = sanitizeHTML`
    <li>
    <img src="img/icon_fmc.png">
    <div class="list-card-content">
      <h2>${name}</h2><p>${description}</p>
      <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
      <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
    </div>
    </li>
    `;

    return listContent;
  }

  // get lat/log by address (geocode)
  function getGeoCodeByAddress() {

  }

  // parse the stores data
  function getStoreDetail() {

  }

  // add lat/log to store data
  function setStoreCoords() {

  }