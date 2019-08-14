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
      <button onClick={() => {this.fetchHelper()}}>"This is a button"</button>
      <div>
        Start:
        <input type="text" ref={this.startLocation}></input>
      </div>
      <div>
        End:
        <input type="text" ref={this.endLocation}></input>
      </div>
      <div>
        {this.state.playlist.map(song => {
            return (
              <div>
                <span>{song.artist}</span> --
                <span>{song.title}</span> 
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
