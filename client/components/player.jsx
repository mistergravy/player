import React from 'react';
import ReactAudioPlayer from 'react-audio-player';
export default class Player extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div>
      <h1>Player</h1>
        <ReactAudioPlayer controls/>
      </div>
    )
  }
}
