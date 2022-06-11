var inputHistory = []; // empty array for search history to go into

// function that deals with the five day api call
function getApi(cityName) {
    var fiveDayForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=537c5082f054c67490bdd35711142b24`;

    var currentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=537c5082f054c67490bdd35711142b24`;

    $.ajax({
        url: fiveDayForecast,
        method: 'GET'
    }).then(function (response) {
        // records the current date to use for the current weather box
        let currentDate = moment().format("M/DD/YYYY");
        $("#city").text(response.city.name + " " + currentDate);
        // iterates over the entire five day forecast array in 8 hour blocks because the api gives forecasts every 3 hours for each day
        for (i = 5; i < response.list.length; i += 8) { // contribution Sue Lee
            // makes a string number value to grab the element with that id value
            let j = i.toString();
            let dateEl = $("<li>");
            // formats the date into a X/XX/XXXX format rather than what the API gives
            dateEl.text(moment(response.list[i].dt_txt).format('M/D/YYYY')); // contribution Sue Lee
            dateEl.attr("class", "bolder");
            // dynamically generate html elements to put in the cards
            let tempEl = $("<li>");
            tempEl.text("Temp: " + response.list[i].main.temp + String.fromCharCode(176) + "F"); 
            let windEl = $("<li>");
            windEl.text("Wind: " + response.list[i].wind.speed + " MPH");
            let humidityEl = $("<li>");
            humidityEl.text("Humidity: " + response.list[i].main.humidity + "%");
            let iconEl = $("<img>");
            iconEl.attr("class", "futureIcon");
            // gets the weather icon code to search up the image
            let iconCode = response.list[i].weather[0].icon;
            let iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            iconEl.attr("src", iconUrl);
            $("#" + j).append(dateEl);
            $("#" + j).append(iconEl);
            $("#" + j).append(tempEl);
            $("#" + j).append(windEl);
            $("#" + j).append(humidityEl);
        }
    }).catch(function (error) {
        console.log(error.responseJSON.cod, error.responseJSON.message);
    })

    $.ajax({
        url: currentWeather,
        method: 'GET',
    }).then(function (response) {
        let temp = response.main.temp;
        let wind = response.wind.speed;
        let humidity = response.main.humidity;
        console.log(temp, wind, humidity);
        $(".temp").text("Temp: " + temp + String.fromCharCode(176) + "F");
        $(".wind").text("Wind: " + wind + " MPH");
        $(".humidity").text("Humditiy: " + humidity + "%");
        let dailyIconCode = response.weather[0].icon;
        let dailyIconUrl = `http://openweathermap.org/img/wn/${dailyIconCode}@2x.png`;
        let img = $("<img>");
        img.attr("src", dailyIconUrl);
        let latitude = response.coord.lat;
        console.log(latitude);
        let longitude = response.coord.lon;
        var oneCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=mintutely,hourly,daily,alerts&appid=537c5082f054c67490bdd35711142b24`;
        // waits for currentWeather call to finish to gather the latitude and longitude needed to query the api
        $.ajax({
            url: oneCall,
            method: 'GET'
        }).then(function (res) {
            $(".uvHeader").text("UV Index: ");
            $("#uvIndex").text(res.current.uvi);
            // checks the uv index value to determine whether the severity of UV that day
            if(res.current.uvi <= 2) {
                $("#uvIndex").attr("class", "safe");
            } else if(res.current.uvi <= 5) {
                $("#uvIndex").attr("class", "warning");
            } else if(res.current.uvi <= 7) {
                $("#uvIndex").attr("class", "orange");
            } else {
                $("#uvIndex").attr("class", "danger");
            }
            // appends the weather icon to the page
            img.appendTo("#city");
        }).catch(function (error) {
            console.log(error.responseJSON.cod, error.responseJSON.message);
        })
    }).catch(function (error) {
        console.log(error.responseJSON.cod, error.responseJSON.message);
    })
}
// handles the functionality to make a query using one of the search history buttons
function historyHandler(event) {
    event.preventDefault();
    console.log($(this));
    let searchInput = $(this).text();
    console.log(searchInput);
    clearCard();
    getApi(searchInput);
}
// handles the functionality so the user can search for the city's weather
function searchHandler(event) {
    event.preventDefault();
    console.log("fired");
    let searchInput = $(".searchInput").val();
    console.log(searchInput);
    storeHistory(searchInput);
    
    clearCard();
    getApi(searchInput);
    getHistory();
}
// clears out any data from last search so the new one can replace the spaces
function clearCard() {
    $("li").remove();
    $(".futureIcon").remove();
}
// stores the user searches into local storage as a pseudo search history
function storeHistory(input) {
    console.log("storing now!")
    console.log(inputHistory);
    inputHistory.push(input);
    localStorage.setItem("input", JSON.stringify(inputHistory));
}
// deals with rendering the user seach history, if any, and puts it on the page while giving it functionality
function getHistory() {
    $(".historyBtn").remove();
    inputHistory = JSON.parse(localStorage.getItem("input"));
    console.log(inputHistory);
    if(inputHistory !== null) {
        for (let i = 0; i < inputHistory.length; i++) {
            let historyBtn = $("<button>");
            historyBtn.attr("class", "historyBtn");
            historyBtn.addClass("btn button btn-primary");
            historyBtn.text(inputHistory[i]);
            $(".searchHistory").append(historyBtn);
        }
        $(".historyBtn").on("click", historyHandler);
    } else {
        return inputHistory = [];
    }
}

// calls render function
getHistory();
// waits for user to click search again
$(".button").on("click", searchHandler);


