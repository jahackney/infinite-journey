import React from 'react';
import './App.css';

const formatDuration = (seconds) => {
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  if (seconds < 10) seconds = '0' + seconds;
  return minutes + ':' + seconds;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlist: []
    };
    this.startLocation = React.createRef();
    this.endLocation = React.createRef();
  }

  fetchHelper = () => {
    let startLocation = this.startLocation.current.value;
    let endLocation = this.endLocation.current.value;
    
    this.doTheFetching(startLocation, endLocation)
      .then((response) => { 
        this.setState({playlist: response.playlist}) 
      });
  };

  doTheFetching = (startLocation, endLocation) => {
    let url = [
      "/api/generatePlaylist?start=",
      encodeURIComponent(startLocation),
      '&end=',
      encodeURIComponent(endLocation)
    ].join('');

    return fetch(url)
      .then(function(response) { 
        return response.text(); 
      })
      .then(function(text) {
        let jsonResponse = JSON.parse(text);
        console.log(jsonResponse);
        return jsonResponse;
      });
  }

  render() {
    return (
    <div className="App">
      <div>
        <input className="input" placeholder="start here" type="text" ref={this.startLocation}></input>
      </div>
      <div>
        <input className="input" placeholder="end here" type="text" ref={this.endLocation}></input>
      </div>
      <button className="button" onClick={() => {this.fetchHelper()}}>get my playlist</button>
      <div>
        {this.state.playlist.map(song => {
            return (
              <div className="songholder">
                <span>{song.artist}</span> - 
                <span className="song">{song.title}</span> 
                <span>({formatDuration(song.duration)})</span>
              </div>
            );
          })}
      </div>
    </div>
  );
    }
}



export default App;
