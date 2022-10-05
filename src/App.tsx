import { useState, useEffect } from 'react';
import './App.css';
// import GameState from './GameState';
import { Card, generateDeck, serializeCard, draw } from './game';



type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
}

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  console.log('deck', deck);
  console.log('discard', discard);
  return {
    deck,
    discard,
  }
}

function App() {
  const serializedGameState = localStorage.getItem('gameState');
  const gameState: GameState = serializedGameState ? JSON.parse(serializedGameState) as GameState : emptyGameState();
  const [deck] = useState(gameState.deck);
  const [discard] = useState(gameState.discard);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify({
      deck,
      discard,
    }));
  }, [deck, discard]);

  return (
    <div className="App">
      <header className="App-header">
        Card game
      </header>

      <h3>Computer Hand</h3>

      <h3>Player Hand</h3>

      <h3>Discard</h3>
      <ul>
        {discard.map(card => (
          <li key={serializeCard(card)}>{serializeCard(card)}</li>
        ))}
      </ul>

      <h3>Deck</h3>
      {/* <ol>
        {deck.map(card => (
          <li key={serializeCard(card)}>{serializeCard(card)}</li>
        ))}
      </ol> */}
    </div>
  );
}

export default App;
