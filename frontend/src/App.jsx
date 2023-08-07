import React, { useState } from 'react';
// import './App.css';
import Lobby from './components/Lobby/Lobby';
import Gameplay from './components/Gameplay/Gameplay';
function App() {
  const [roomId, setRoomId] = useState(null);
  return (
    <div className="App">
      {!roomId ? <Lobby onRoomCreated={setRoomId} /> : <Gameplay roomId={roomId} />}
    </div>
  );
}

export default App;
