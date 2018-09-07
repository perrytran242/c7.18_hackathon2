const runningTrails = [];

/**
 * Listen for the document to load and initialize the application
 */
$(document).ready(initializeApp);

/**
 * global variables here if any 
 */

/***************************************************************************************************
 * initializeApp 
 * @params {undefined} none
 * @returns: {undefined} none
 * initializes the application
 */
function initializeApp() {
    addClickHandlersToElements();
}

/***************************************************************************************************

 * addClickHandlerstoElements
 * @params {undefined} 
 * @returns  {undefined}
 *     
 */
function addClickHandlersToElements() {
    $('#runButton').click(ajaxYelpCall);
    $('#runButton').click(getDataFromMeetUp);
    let eventListener = $("#search_input");
    eventListener.on("keyup", event => {
        if (event.keyCode === 13) { //if enter key is released
            $("#runButton").click(); //runs the function attaches to click event off add button
        }
    });
}


function checkIfInputZipIsValid(zip) {
    var valid = true;
    if (zip.length != 5 || isNaN(zip)) {
        $('#error_msg').removeClass('hidden');
        valid = false;
    }
    return valid;
}
/***************************************************************************************************
 * displayMapToDom - display map based on the the location (based on zip code or city user inputs)
 * @param: location //an array of objects
 * @returns: none
 * @calls: none
 */
function displayMapOnDom() {
    $(".landing_page").addClass("hidden");
    $(".map_page").removeClass("hidden");
    //Map options
    const options = {
        zoom: 10,
        center: runningTrails[0],
    }
    //New map
    let map = new google.maps.Map(document.getElementById("map_area"), options);
    //Add marker

    for (var trailIndex = 1; trailIndex < runningTrails.length; trailIndex++) {
            let marker = new google.maps.Marker({
                position: runningTrails[trailIndex].coordinates,
                map: map,
                animation: google.maps.Animation.DROP,
                icon: "images/Winged_Shoe.png",

            });
            let contentString = "<h3>" + runningTrails[trailIndex].name + "</h3>";
            let infoWindow = new google.maps.InfoWindow({
                content: contentString
            })

            marker.addListener('click', function () {
                infoWindow.open(map, marker);
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });
    }
    renderInformationOnDom(runningTrails);
}

/***************************************************************************************************
 * renderyDirection - display direction based on the the pick
 * @param: pick
 * @returns: none
 * @calls: none
 */
function renderDirectionOnDom(pick) {

}

/***************************************************************************************************
 * ajaxYelpCall - display available locations for running based on yelp database
 * @param: location
 * @returns: none
 * @calls: none
 */


function ajaxYelpCall () {
    let userLocation = $("#search_input").val();
    $('#search_input').focus(function () {
        $('#error_msg').addClass('hidden');
    });

    if (checkIfInputZipIsValid(userLocation)) {
        getDataFromWeather(userLocation);
    } else {
        $("#search_input").val('');
        ajaxYelpCall();
    }
    $('#error_msg').text('');
    $('.landing_page').addClass('hidden')
    $('.meerkat').removeClass('hidden')
    const ajaxParameters = {
        dataType: 'JSON',
        url: "http://yelp.ongandy.com/businesses",
        method: 'POST',
        data: {
            api_key: 'u7VrqD4pyVGW_uBAod5CCKlJiM4pTyFGYzKyYWXV8YHidu5BsdPN20PhYEJflT-vOhZ7mFXHpHCIeyKTA-0xZ9LJcCg_jDK-B3WvRCmYvU1DdCXioFo8mTSIhRmPW3Yx',
            term: 'running trail park',
            location: userLocation,
        },
        success: getDataFromYelp,
        error: function (response) {
            console.log('error');
        }
    }
    $.ajax(ajaxParameters);
}

/***************************************************************************************************
 * renderLocationPicturesToDom - display pictures of the location
 * @param: location
 * @returns: none
 * @calls: none
 */

// function renderLocationPicturesOnDom(runningTrailsArray) {

// }

/***************************************************************************************************
 * renderyWeatherToDom - display weather based on the location
 * @param: location
 * @returns: none
 * @calls: none
 */
function renderWeatherOnDom ( weather ) {
    let imgSrc = getImgForWeather (weather);
    let weatherImage = $('<img class="weather_icon">').attr({"src":imgSrc, "alt":imgSrc});
    // $('.location_list').append(weatherImage);
    let today = new Date();
    let hrs = today.getHours();
    if (hrs > 19 || hrs < 6) //it's night time
        $('.location_list').css({"background-image": "url('images/nightTime.jpg')", "color":"white"});
    else //it's day time
        $('.location_list').css("background-image", "url('images/dayTime.jpg')");
    let headline = $('<p>').append(`${weather.cityName}`);
    let line0 = $('<li>').append(weather.conditionDescription.toUpperCase());
    let line1 = $('<li>').append(today);
    let line2 = $('<li>').append(`Current temperature: ${weather.currentTempInF} °F `);
    let line3 = $('<li>').append(`High: ${weather.tempMaxInF} °F / Low: ${weather.tempMinInF} °F `);
    let line4 = $('<li>').append(`Humidity: ${weather.humidity} %`);
    let line5 = $('<li>').append(`Wind: ${weather.wind} m/s`);

    let weatherList = $('<ul class="weather_list hidden">')
    weatherList.append(weatherImage, headline, line0, line1, line2, line3, line4, line5);
    // $('.weather_display').append(line0, line1, line2, line3);
    $('.location_list').append(weatherList);
}

function displayWeather() {
    $('.list_result').addClass('hidden');
    $('.events').addClass('hidden');
    $('.description').addClass('hidden');
    $('.weather_list').removeClass('hidden');
}

function displayDescription() {
    $('.list_result').addClass('hidden');
    $('.events').addClass('hidden');
    $('.weather_list').addClass('hidden');
    $('.description').removeClass('hidden');
}

function displayResult() {
    $('.events').addClass('hidden');
    $('.weather_list').addClass('hidden');
    $('.description').addClass('hidden');
    $('.list_result').removeClass('hidden');
    $('#map_area').text();
    $('.single_location_detail').addClass('hidden');
    displayMapOnDom();
}

function displayMeetUp() {
    $('.description').addClass('hidden');
    $('.list_result').addClass('hidden');
    $('.weather_list').addClass('hidden');
    $('.events').removeClass('hidden');
}

function displayDirection() {
    $('.description').addClass('hidden');
    $('.list_result').addClass('hidden');
    $('.weather_list').addClass('hidden');
    $('.events').addClass('hidden');
}

function getImgForWeather(weather) {
    var imgSrc;
    switch (weather.condition) {
        case 'Haze':
            imgSrc = 'images/haze.png';
            break;
        case 'Clouds':
            imgSrc = 'images/clouds.png';
            break;
        case 'few clouds':
            imgSrc = 'images/clouds.png';
            break;    
        case 'Sunny':
            imgSrc = 'images/sunny.png';
            break;
        case 'Clear':
            imgSrc = 'images/clear.png';
            break;
        default:
            imgSrc = 'images/default.png';             
    }
    return imgSrc;
}

/***************************************************************************************************
 * get data from each server
 * 
 * 
 */
function getDataFromGoogleMap() {

}

function getDataFromYelp(response) {
    $('.meerkat').addClass('hidden');
    const businessesIndex = response.businesses;
        let {
        latitude,
        longitude
    } = response.region.center;
    let center = new google.maps.LatLng(latitude, longitude);
    runningTrails.push(center);
    console.log(businessesIndex);
    for (let i = 1; i < businessesIndex.length; i++) {
        let yelpObject = {};
        let {
            latitude,
            longitude
        } = businessesIndex[i].coordinates;
        let coordinates = new google.maps.LatLng(latitude, longitude);
        let {
            rating,
            distance
        } = businessesIndex[i];
        runningTrails.push({
            name: businessesIndex[i].name,
            location: businessesIndex[i].location,
            coordinates: coordinates,
            image: businessesIndex[i].image_url,
            rating: businessesIndex[i].rating,
            distance: (businessesIndex[i].distance / 1000).toFixed(1) + " miles"
        })
    }
    displayMapOnDom();
}

function getDataFromMeetUp() {
    let zipCode = $("#search_input").val();
    let meetup = {
        url: `https://api.meetup.com/2/open_events?&sign=true&photo-host=public&zip=${zipCode}&topic=running&page=20&key=647a3e362fa1b49424a3566149136e`,
        success: displayMeetUpSuccess,
        method: 'post',
        dataType: 'jsonp',
        error: displayError,
    }
    $.ajax(meetup);
}


function displayMeetUpSuccess(response) {
    let meetUpResponse = response.results;
    let filteredMeetUpResults = [];
    for (let m = 0; m < meetUpResponse.length; m++) {
        let {
            description,
            name,
            event_url,
            time,
            group,
            yes_rsvp_count
        } = meetUpResponse[m];
        let formattedInfo = {
            description,
            eventName: name,
            link: event_url,
            time,
            group,
            yes_rsvp_count
        }
        formattedInfo.time = Date(parseInt(formattedInfo.time))
        filteredMeetUpResults.push(formattedInfo);
    }
    renderMeetUpOnDom(filteredMeetUpResults)
}


function getDataFromWeather(zipCode) {
    const SGT_API = {
        url: `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&APPID=9538ca63e1e6a5306d06af4048ad137f`,
        method: 'post',
        dataType: 'json',
        success: displayWeatherSuccess,
        error: displayError,
    }
    $.ajax(SGT_API);
}

function displaySuccess(response) {
    response = response;
    return response;
}

function displayWeatherSuccess(responseFromServer) {
    let weather = {};
    weather.condition = responseFromServer.weather[0]['main'];
    weather.cityName = responseFromServer.name;
    weather.conditionDescription = responseFromServer.weather[0]['description']; 
    weather.tempMinInF = (responseFromServer.main['temp_min'] * 9 / 5 - 459.67).toFixed(1);
    weather.tempMaxInF = (responseFromServer.main['temp_max'] * 9 / 5 - 459.67).toFixed(1);
    weather.currentTempInF = (responseFromServer.main['temp'] * 9 / 5 - 459.67).toFixed(1);
    weather.humidity = responseFromServer.main['humidity'];
    weather.wind = responseFromServer.wind['speed'];
    renderWeatherOnDom(weather);
}

function displayError() {
    console.log("AJAX call failed :(")
}
