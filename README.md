*This project was created during my time as a student at Code Chrysalis.*
Aug 2019

# About This App
This project was built in two days. Infinite journey is an app that takes in two destinations, calculates the duration of the trip, and returns a playlist of that length...

![start](/images/start.png)

It returns only songs about that state, for the length of time you are in that state.

![next](/images/next.png)

## Available Scripts

In the project directory, you can run:

#### `yarn start`

This starts the server.js file

#### `yarn dev`

The starts the development server

## Navigating This Repo

- `/server/api.js` is where all of the logic is for making the third party API calls
- `server.js` is the server and main endpoint
- `src/*` are the frontend files

## APIs

The project uses:

Google Directions API
Google Geocoding API
iTunes API

## How I Built This

I used the Directions API from Google Maps to calculate distance and duration between locations. 

```
"legs" : [
            {
               "distance" : {
                  "text" : "35.9 mi",
                  "value" : 57824
               },
               "duration" : {
                  "text" : "51 mins",
                  "value" : 3062
               },
               "end_address" : "Universal Studios Blvd, Los Angeles, CA 90068, USA",
               "end_location" : {
                  "lat" : 34.1330949,
                  "lng" : -118.3524442
               },
               "start_address" : "Disneyland (Harbor Blvd.), S Harbor Blvd, Anaheim, CA 92802, USA",
               "start_location" : {
                  "lat" : 33.8098177,
                  "lng" : -117.9154353
               },

```
Then I took the latitude and longitude from those results and used those to get the "administrative_area_level_1"
from the Google Maps Geocoding API. (Because this is not US-specific, it means it also works for cities in other countries - try Tokyo to Kyoto).

With that, I searched the iTunes API by state to get song titles containing that state


## Deployment

This project was deployed on Heroku [here](https://infinite-journey-19924.herokuapp.com/)





