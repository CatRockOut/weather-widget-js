import { apiKey } from './config.js';

function initWeatherWidget() {
    const searchInput = document.querySelector('.search');
    
    if (!searchInput) {
        return;
    }

    const clearSearch = document.querySelector('.clear-search');
    const celectedCities = document.querySelectorAll('.celected-city');
    const weatherDays = document.querySelector('.weather-days');
    const littleWidget = document.querySelector('.little-widget');

    // Clicking on the custom cross to clear the input field:
    clearSearch && clearSearch.addEventListener('click', () => {
        searchInput.value = '';
    });

    // Finding your own location:
    const showPosition = async (position) => {
        // Get latitude and longitude:
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const urlCurrentLocation = 'http://api.openweathermap.org/geo/1.0/reverse?lat=' + latitude + '&lon=' + longitude + '&appid=' + apiKey;
    
        try {
            const response = await fetch(urlCurrentLocation);
            if (!response) {
                throw new Error('Network response was not okay. Please try again.');
            }

            // Getting your own location:
            const data = await response.json();
            console.log('Your location:', data);
            const currentLocation = data[0].name;
            searchInput.value = currentLocation;

            // Trigger the 'Enter' key event on the input to simulate search after auto-filling:
            const keyupEvent = new KeyboardEvent('keyup', { key: 'Enter' });
            searchInput.dispatchEvent(keyupEvent);

        } catch (error) {
            console.log(error.message);
        }
    };

    // Errors if location is unknown:
    const showError = (error) => {
        if (error.code === error.PERMISSION_DENIED) {
            alert('You have canceled a location request.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert('Location information is not available.');
        } else if (error.code === error.TIMEOUT) {
            alert('Location request timed out.');
        } else if (error.code === error.UNKNOWN_ERROR) {
            alert('An unknown error occurred while requesting a geolocation.');
        }
    };

    // Request user location:
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert('Your browser does not support geolocation.');
        }
    };
    
    getUserLocation();

    // API manipulation:
    searchInput && searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            const searchInputValue = searchInput.value;
            const url = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&q=' + searchInputValue + '&appid=' + apiKey;

            // Capitalize the first letters:
            const capitalizeFirstLetters = (input) => {
                searchInput.classList.remove('error');
                document.querySelector('.error-text').style.display = 'none';
                return input.replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());
            };

            const fetchData = async () => {
                const response = await fetch(url);
                const json = await response.json();
                return json;
            };

            const getData = async () => {
                try {
                    const data = await fetchData(url);
                    console.log(data)

                    // Display of the selected city:
                    celectedCities.forEach((celectedCity, index) => {
                        const formattedCityName = capitalizeFirstLetters(searchInputValue);
                        searchInput.value = formattedCityName;

                        const textPart = [
                            `Celected: ${formattedCityName}, ${data.city.name}, ${data.city.country}`,
                            `${data.city.name}, ${data.city.country}`
                        ];

                        celectedCity.textContent = textPart[index];
                    });

                    // Template for picking weather pictures:
                    const getWeatherImageUrl = (description) => {
                        switch (description) {
                            case 'Clear':
                                return './img/fox-sun.svg';
                            case 'Clouds':
                                return './img/fox-cloudly.svg';
                            case 'Drizzle':
                                return './img/fox-light-rain.svg';
                            case 'Rain':
                                return './img/fox-rain.svg';
                            case 'Thunderstorm':
                                return './img/fox-thunderstorm.svg';
                            case 'Snow':
                                return './img/fox-snow.svg';
                            default:
                                return './img/fox.svg';
                        }
                    };

                    // Convert time to days:
                    const getDayOfWeek = (timestamp) => {
                        const date = new Date(timestamp * 1000);
                        const dayOfWeek = date.getDay();
                        return dayOfWeek;
                    };
                
                    // Dynamic change of all elements:
                    const updateWeather = (data) => {
                        let widgetTemplate = '';
                        let daysTemplate = '';
                        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

                        // Weather image for little widget - calling the function 'getWeatherImageUrl':
                        const descriptionOfWeather = data.list[0].weather[0].main;
                        const imageUrl = getWeatherImageUrl(descriptionOfWeather);

                        // Litlte widget:
                        widgetTemplate += `
                            <div class="widget__inner">
                                <h1 class="temp__min">${data.list[0].main.temp_min} &deg;C</h1>
                                <div class="widget__inner-temp">
                                    <span class="type-weather">${data.list[0].weather[0].main}</span>
                                    <span class="temp__max">${data.list[0].main.temp_max} &deg;C</span>
                                </div>
                            </div>
                            <div class="widget__type">
                                <div class="widget__inner-type">
                                    <span class="description-weather">${data.list[0].weather[0].description}</span>
                                    <span class="celected-city">${celectedCities[1].textContent}</span>
                                </div>
                                <img class="weather-picture" src="${imageUrl}" alt="weather-picture">
                            </div>
                        `;
        
                        // Finding all indexes in JSON for manipulation with days:
                        for (let i = 0; i < data.list.length; i += 8) {
                            const item = data.list[i];

                            // Calling the function 'getDayOfWeek' to display the name day of the week in a card day:
                            const dayOfWeek = getDayOfWeek(item.dt);
                            const dayAbbreviation = days[dayOfWeek];

                            // Type of weather:
                            const typeOfWeather = item.weather[0].main;

                            // Max and min temp of weather:
                            const tempMin = item.main.temp_min;
                            const tempMax = item.main.temp_max;

                            // Weather images for card days - calling the function 'getWeatherImageUrl':
                            const descriptionOfWeather = item.weather[0].main;
                            const imageUrl = getWeatherImageUrl(descriptionOfWeather);

                            // Card days:
                            daysTemplate += `
                                <li class="card-day">
                                    <span class="name-day">${dayAbbreviation}</span>
                                    <img class="weather-picture" src="${imageUrl}" alt="weather-picture">
                                    <span class="type-weather">${typeOfWeather}</span>
                                    <div class="card-day__temp">
                                        <span class="day-type">Day</span>
                                        <span class="day-type__temp">${tempMax} &deg;C</span>
                                        <span class="day-type__temp">${tempMin} &deg;C</span>
                                        <span class="day-type">Night</span>
                                    </div>
                                </li>
                            `;
                        }

                        littleWidget.innerHTML = widgetTemplate;
                        weatherDays.innerHTML = daysTemplate;
                    };
        
                    updateWeather(data);
                    
                } catch (error) {
                    console.log(error.message);

                    // Input error with non-existent city name:
                    if (error.message === `Cannot read properties of undefined (reading 'name')`) {
                        searchInput.classList.add('error');
                        searchInput.value = '';
                        document.querySelector('.error-text').style.display = 'block';
                    }
                }
            };
        
            getData(url);
        }
    });
};

document.addEventListener('DOMContentLoaded', initWeatherWidget);