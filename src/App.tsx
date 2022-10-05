import React, { useState, useEffect } from 'react';
import Hand from './Hand';
import { Card, generateDeck, serializeCard, draw } from './game';



type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
  playerHand: Array<Card>,
  compHand: Array<Card>,
}

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  const playerHand = draw(deck, 10);
  const compHand = draw(deck, 10);
  return {
    deck,
    discard,
    playerHand,
    compHand,
  }
}

function App() {
  const serializedGameState = localStorage.getItem('gameState');
  const gameState: GameState = serializedGameState ? JSON.parse(serializedGameState) as GameState : emptyGameState();
  const [deck] = useState(gameState.deck);
  const [discard] = useState(gameState.discard);
  const [playerHand] = useState(gameState.playerHand);
  const [compHand] = useState(gameState.compHand);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify({
      deck,
      discard,
      playerHand,
      compHand,
    }));
  }, [deck, discard, playerHand, compHand]);

  return (
    <div className="App">
      <header className="App-header">
        Card game
      </header>

      <h3>Computer Hand</h3>
      <Hand hand={compHand} />

      <h3>Player Hand</h3>
      <Hand hand={playerHand} />

      <h3>Discard</h3>
      <ul>
        {discard.map(card => (
          <li key={serializeCard(card)}>{serializeCard(card)}</li>
        ))}
      </ul>

      {/* <h3>Deck</h3> */}
      {/* <ol>
        {deck.map(card => (
          <li key={serializeCard(card)}>{serializeCard(card)}</li>
        ))}
      </ol> */}
    </div>
  );
}

export default App;
