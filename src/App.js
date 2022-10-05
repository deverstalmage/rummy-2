import { useState } from 'react';
import './App.css';
import GameState from './GameState.js';

function App() {
  const [deck, setDeck] = useState();



  return (
    <div className="App">
      <header className="App-header">
        Card game
      </header>
      <GameState>
        <p>testing...</p>
      </GameState>
    </div>
  );
}

export default App;
