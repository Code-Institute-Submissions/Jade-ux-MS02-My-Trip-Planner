"use strict";

let map;
let places;
let infoWindow;
let markers = [];
let autocomplete;
let countryField = document.getElementById("country");
let cityField = document.getElementById("autocomplete");
const countryRestrict = {
  country: "all",
};
const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";
const hostnameRegexp = new RegExp("^https?://.+?/");
//List of countries for drop-down
const countries = {
  all: {
    center: {
      lat: 15,
      lng: 0,
    },
    zoom: 2,
  },
  au: {
    center: {
      lat: -25.3,
      lng: 133.8,
    },
    zoom: 4,
  },
  br: {
    center: {
      lat: -14.2,
      lng: -51.9,
    },
    zoom: 3,
  },
  ca: {
    center: {
      lat: 62,
      lng: -110.0,
    },
    zoom: 3,
  },
  fr: {
    center: {
      lat: 46.2,
      lng: 2.2,
    },
    zoom: 5,
  },
  de: {
    center: {
      lat: 51.2,
      lng: 10.4,
    },
    zoom: 5,
  },
  mx: {
    center: {
      lat: 23.6,
      lng: -102.5,
    },
    zoom: 4,
  },
  nz: {
    center: {
      lat: -40.9,
      lng: 174.9,
    },
    zoom: 5,
  },
  it: {
    center: {
      lat: 41.9,
      lng: 12.6,
    },
    zoom: 5,
  },
  za: {
    center: {
      lat: -30.6,
      lng: 22.9,
    },
    zoom: 5,
  },
  es: {
    center: {
      lat: 40.5,
      lng: -3.7,
    },
    zoom: 5,
  },
  pt: {
    center: {
      lat: 39.4,
      lng: -8.2,
    },
    zoom: 6,
  },
  us: {
    center: {
      lat: 37.1,
      lng: -95.7,
    },
    zoom: 3,
  },
  uk: {
    center: {
      lat: 54.8,
      lng: -4.6,
    },
    zoom: 5,
  },
};
//Focuses the country field when document loads
$(document).ready(function() {
    countryField.focus();
});
/**
 * Initialises the map
 */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: countries["all"].zoom,
    center: countries["all"].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: true,
    streetViewControl: false,
  });
  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById("info-content"),
  });
  //Create the autocomplete object and associate it with the 'cities' search box.
  //Restrict the search to the UK and place type to 'cities'.
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("autocomplete"),
    {
      types: ["(cities)"],
      componentRestrictions: countryRestrict,
    }
  );
  places = new google.maps.places.PlacesService(map);
  //Add an event listener to the country
  autocomplete.addListener("place_changed", onPlaceChanged);
  //Zoom the map to the chosen city
  document
    .getElementById("country")
    .addEventListener("change", setAutocompleteCountry);
}
/**
 * Listens for place changing on user input
 */
function onPlaceChanged() {
  const place = autocomplete.getPlace();
  if (place.geometry) {
    map.panTo(place.geometry.location);
    map.setZoom(15);
  } else {
    cityField.placeholder = "Enter a city";
  }
  let activityField = document.getElementById("activity");
  activityField.focus();
}
function focusCity(){
    cityField.focus();
}
//Activity options
const activityMap = {
  accommodation: ["lodging"],
  restaurant: ["restaurant"],
  museum: ["museum"],
  art_gallery: ["art_gallery"],
  attraction: ["tourist_attraction", "zoo", "aquarium"],
  entertainment: ["casino", "bowling_alley", "amusement_park", "movie_theater"],
  night_life: ["night_club", "bar"],
  shopping: [
    "shopping_mall",
    "jewelry_store",
    "home_goods_store",
    "clothing_store",
    "book_store",
    "store",
    "shoe_store",
  ],
  worship: ["church", "mosque", "hindu_temple", "synagogue"],
  spa: ["spa", "beauty_salon", "hair_care"],
};
/**
 * Activated when search is changed on activity drop-down
 */
function searchActivity() {
    if (countryField.value == 'all') {
        alert("Please choose a country before searching for an activity")
        resetForm();
    }else{
        searchOptions($("#activity").val());
    }
}
/**
 * Searches the options specified by the activity parameter
 * @param {string} activity to be searched
 */
function searchOptions(activity) {
  var search = {
    bounds: map.getBounds(),
    types: activityMap[activity],
  };
  places.nearbySearch(search, (results, status, pagination) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();
      for (let i = 0; i < results.length; i++) {
        const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
        const markerIcon = MARKER_PATH + markerLetter + ".png";
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon,
        });
        //This opens an infobox when an icon on the map is clicked
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], "click", showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
      }
    }
  });
}
/**
 * Clears the markers when a new type of activity is chosen
 */
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}
/**
 * Sets the country within which the autocomplete will search
 */
function setAutocompleteCountry() { 
  const country = document.getElementById("country").value;
  if (country == "all") {
    autocomplete.setComponentRestrictions({
      country: [],
    });
    map.setCenter({
      lat: 15,
      lng: 0,
    });
    map.setZoom(2);
  } else {
    autocomplete.setComponentRestrictions({
      country: country,
    });
    map.setCenter(countries[country].center);
    map.setZoom(countries[country].zoom);
  }
  clearResults();
  clearMarkers();
}

//When new city is chosen this clears the activity from the drop-down and sets the default to 'Places to visit'
function clearActivity(){
    document.getElementById("activity").selectedIndex = "0";
}
//Resets all options when reset button is clicked.
function resetForm(){
    document.getElementById("tripForm").reset();
}
//If user is trying to search a city before choosing a country this alerts them to choose a country first
function isCountryChosen(){
        if (countryField.value == 'all') {
        alert("Please choose a country before searching for a city")
        resetForm();
        countryField.focus();
    }
}
/**
 * Adds markers to the map for each place that equals the activity searched
 * @param {number} i
 */
function dropMarker(i) {
  return function () {
    markers[i].setMap(map);
  };
}
/**
 * Adds all results of the searched activity to the map and results table
 * @param {object} result
 * @param {number} i
 */
function addResult(result, i) {
  const results = document.getElementById("results");
  const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
  const markerIcon = MARKER_PATH + markerLetter + ".png";
  const tr = document.createElement("div");
  tr.style.backgroundColor = i % 2 === 0 ? "#6fbdbf" : "#c8f3f4";
  tr.className = "col-lg-4 col-12";
  tr.onclick = function () {
    google.maps.event.trigger(markers[i], "click");
  };
  const iconTd = document.createElement("div");
  const nameTd = document.createElement("div");
  nameTd.className = "listing-name-block";
  nameTd.style.color = i % 2 === 0 ? "#ffffff" : "#000000";
  const icon = document.createElement("img");
  iconTd.className = "listing-icon-block";
  icon.src = markerIcon;
  icon.setAttribute("class", "placeIcon");
  icon.setAttribute("className", "placeIcon");
  const name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}
function clearResults() {
  const results = document.getElementById("results");
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

/**
 * Creates an infowindow containing information about the place
 */
function showInfoWindow() {
  const marker = this;
  places.getDetails(
    {
      placeId: marker.placeResult.place_id,
    },
    (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infoWindow.open(map, marker);
      buildIWContent(place);
    }
  );
} 

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById("iw-icon").innerHTML =
    '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
  document.getElementById("iw-url").innerHTML =
    '<b><a id="placeName" href="' + place.url + '">' + place.name + "</a></b>";
  document.getElementById("iw-address").textContent = place.vicinity;
  if (place.formatted_phone_number) {
    document.getElementById("iw-phone-row").style.display = "";
    document.getElementById("iw-phone").textContent =
      place.formatted_phone_number;
  } else {
    document.getElementById("iw-phone-row").style.display = "none";
  } // Assign ratings to places
  if (place.rating) {
    let ratingHtml = "";
    for (let i = 0; i < 5; i++) {
      if (place.rating < i + 0.5) {
        ratingHtml += "&#10025;";
      } else {
        ratingHtml += "&#10029;";
      }
      document.getElementById("iw-rating-row").style.display = "";
      document.getElementById("iw-rating").innerHTML = ratingHtml;
    }
  } else {
    document.getElementById("iw-rating-row").style.display = "none";
  }
  //Builds itinerary content
  /*
  let myForm = document.getElementById("myForm");
  let entry = document.getElementById("placeName");
  let date = document.getElementById("iw-date");
  let actualItinerary = document.getElementById("actualItinerary");
  */

   };

//Resets the 'Add to itinerary' form when someone opens a new infowindow

function resetItineraryForm(){
    document.getElementById("myForm").reset();
}

  //Inspiration from: https://jsbin.com/fawufajoke/edit?html,css,js,console,output
$('#addToItinerary').on('click',function(event){
  
//Here I need to an if statement that will alert user if date field is left blank
let entry = document.getElementById("placeName");
let actualItinerary = document.getElementById("actualItinerary");

  event.preventDefault();
  
  let itineraryList = $.parseJSON($('#AllData').val());
  
  let newEvent =  {
    'Title': $(entry).html(), 
    'Date': $('[name="event-date"]').val(),   
  };
  
  itineraryList.push(newEvent);
  
  $('#AllData').val(JSON.stringify(itineraryList));
  
    console.log(itineraryList);
  //Here I either need a for loop for each item in the array, or I need to appendChild to append the object text to the li and append the li to the ul each time I click 'Add to itinerary'

  let currentEventDate = newEvent.Date;
  let currentEventTitle = newEvent.Title;
  //Here I need to add a delete button to enable user to delete the item
  let itineraryHTML = `<li class="itinerary-list-item"><div class="inner-div col-6">${currentEventDate}&nbsp;</div><div class="col-6 inner-div">${currentEventTitle}</div></li>`;
actualItinerary.insertAdjacentHTML("beforeend", itineraryHTML);

$(entry).empty();
resetItineraryForm()

   });
   //End


   
//My object constructor that is not working:
    /*function ItineraryEvent(entryDate, title){
    this.eventDate = entryDate;
    this.eventTitle = title;
}
    var newEvent = new ItineraryEvent(date, entry);
    console.log(newEvent.eventTitle, newEvent.eventDate); */


 /* myForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createEntry();
  });

  //-----------------------------------------OLD Function.
  /**
   * Passes the data from the infowindow to the itinerary to create an entry
   * @param {date-string} x date to be added
   * @param {string} z name of venue to be added
   */
  /*function createEntry() {

    let ourHTML = `<li class="itinerary-list-item"><div class="inner-div col-6">${x}&nbsp;</div><div class="col-6 inner-div">${z}</div></li>`;
    actualItinerary.insertAdjacentHTML("beforeend", ourHTML);
    //entry.innerHTML = "";
    //date.value = "";
  }
    */
 
