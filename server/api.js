const fetch = require("node-fetch");

const mapsApiKey = 'AIzaSyAQu3RJ2bGWHLs2sZmMaEREUCYBrK_GAEU';


const applyStateInfoToLocations = (stateArray) => {
  return applyStateInfoToLocationsHelper(stateArray, 0, stateArray.length);
};

const applyStateInfoToLocationsHelper = (stateArray, start, end) => {
  let locationPromises = [null, null];
  
  let startState = stateArray[start];
  let endState = stateArray[end - 1];

  if (startState.stateCode === null) {
    locationPromises[0] = getStateFromLocation(startState.latitude, startState.longitude);
  } else {
    locationPromises[0] = startState;
  }
  if (endState.stateCode === null) {
    locationPromises[1] = getStateFromLocation(endState.latitude, endState.longitude);
  } else {
    locationPromises[1] = endState;
  }

  return Promise.all(locationPromises).then((locations) => {
    if (locations[0].stateCode === locations[1].stateCode) {
      for (let i = start; i < end; ++i) {
        stateArray[i].stateCode = locations[0].stateCode;
        stateArray[i].stateName = locations[0].stateName;
      }
    } else {
      stateArray[start].stateCode = locations[0].stateCode;
      stateArray[start].stateName = locations[0].stateName;
      stateArray[end - 1].stateCode = locations[1].stateCode;
      stateArray[end - 1].stateName = locations[1].stateName;
      if (start !== end - 1) {
        let mid = Math.floor((start + end) / 2);
        return Promise.all([
          applyStateInfoToLocationsHelper(stateArray, start, mid),
          applyStateInfoToLocationsHelper(stateArray, mid, end)])
          .then(() => {
            return stateArray;
          });
      }
    }
    return stateArray;
  })
};


const getStateFromLocation = (lat, lng) => {
  
  let url = [
    "https://maps.googleapis.com/maps/api/geocode/json",
    "?latlng=", lat, ",", lng,
    "&key=", mapsApiKey
  ].join("");
 
  return fetch(url)
    .then((response) => {
      return response.text();
    })
    .then((textResponse) => {
      let locationObject = JSON.parse(textResponse);
      for (let address of locationObject.results[0].address_components) {
        if (address.types.includes("administrative_area_level_1")) {
          return {
            stateName: address.long_name,
            stateCode: address.short_name
          };
        }
      }
      // this name is used as the search term for the song search. If no state can
      // be found from the address, just give something back that can maybe generate
      // reasonable songs.
      return {
        stateName: "road trip",
        stateCode: "??"
      };
    })
};

function generatePlaylistForTrip(start, end) {
  return getStatesAndDurationsForTrip(start, end)
    .then((stateList) => {
      let playlistPromises = [];
      for (let stateInfo of stateList) {
        let stateName = stateInfo.stateName;
        let duration = stateInfo.duration;

        playlistPromises.push(generatePlaylistForKeyword(stateName, duration));
      }
      
      return Promise.all(playlistPromises).then((playlistsForStates) => {
        let aggregatedPlaylist = [];
        for (let playlistForState of playlistsForStates) {
          for (let song of playlistForState.playlist) {
            aggregatedPlaylist.push(song);
          }
        }
        return aggregatedPlaylist;
      });
    })
    .then((aggregatedPlaylist) => {

      let totalDuration = 0;
      for (let song of aggregatedPlaylist) {
        totalDuration += song.duration;
      }

      return {
        duration: totalDuration,
        playlist: aggregatedPlaylist
      };
    });
}

function getStatesAndDurationsForTrip(start, end) {
  let url = [
    'https://maps.googleapis.com/maps/api/directions/json',
    '?origin=', encodeURIComponent(start),
    '&destination=', encodeURIComponent(end),
    '&key=', mapsApiKey
  ].join('');

  return fetch(url)
    .then((response) => {
      return response.text();
    })
    .then(async (rawResponse) => {
      let obj = JSON.parse(rawResponse);
      let locationArray = [];
      for (let step of obj.routes[0].legs[0].steps) {

        let latitude = step.end_location.lat;
        let longitude = step.end_location.lng;
        let duration = step.duration.value;

        locationArray.push({latitude, longitude, duration, stateName: null, stateCode: null });
      }
      return applyStateInfoToLocations(locationArray);
    })
    .then((stateInfoArray) => {
      let output = [];
      for (let stateInfo of stateInfoArray) {
        let { stateName, stateCode, duration } = stateInfo;

        if (output.length === 0 || output[output.length - 1].stateCode !== stateCode) {
          output.push({ stateCode, stateName, duration });
        } else {
          output[output.length - 1].duration += duration;
        }
      }
      
      return output;
    });
}

function generatePlaylistForKeyword(keyword, desiredDuration) {
  
  let url = [
    'https://itunes.apple.com/search',
    '?country=us',
    '&media=music',
    '&attribute=songTerm',
    '&term=', encodeURIComponent(keyword)
  ].join('');

  return fetch(url)
    .then(function(response) {
      return response.text();
    })
    .then((textResponse) => {
      let res = JSON.parse(textResponse);
      let responseArray = res.results;

      let tracklist = [];
      for (let i = 0; i < responseArray.length; i++) {
        let songObject = {
          title: responseArray[i].trackName,
          artist: responseArray[i].artistName,
          duration: Math.floor(responseArray[i].trackTimeMillis / 1000)
        }
        tracklist.push(songObject);
      }
      let d = 0;
      let playlist = [];
      let i = 0;
      while (d < desiredDuration) {
        let song = tracklist[i % tracklist.length];
        playlist.push(song);
        d += song.duration;
        i++;
      }

      return { playlist };
    });
}

module.exports = generatePlaylistForTrip;
