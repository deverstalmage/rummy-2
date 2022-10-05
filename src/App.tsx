import React, { useState, useEffect } from 'react';
import Hand from './Hand';
import { Card, generateDeck, serializeCard, draw } from './game';
import CardDisplay from './Card';
import styles from './App.module.css';

type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
  playerHand: Array<Card>,
  compHand: Array<Card>,
  turn: 'player' | 'comp';
}

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  const playerHand = draw(deck, 10);
  const compHand = draw(deck, 10);
  const turn = 'player';
  return {
    deck,
    discard,
    playerHand,
    compHand,
    turn,
  }
}

function App() {
  const serializedGameState = localStorage.getItem('gameState');
  const gameState: GameState = serializedGameState ? JSON.parse(serializedGameState) as GameState : emptyGameState();
  const [deck] = useState(gameState.deck);
  const [discard] = useState(gameState.discard);
  const [playerHand] = useState(gameState.playerHand);
  const [compHand] = useState(gameState.compHand);
  const [turn] = useState(gameState.turn);
  const [action, setAction] = useState('');

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify({
      deck,
      discard,
      playerHand,
      compHand,
      turn,
    }));
  }, [deck, discard, playerHand, compHand, turn]);

  const resetAction = () => setAction('');

  return (
    <div className={styles.game}>
      <div className={styles.section}>
        <div>
          <strong>Whose turn?</strong>
          <p>{turn}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Computer Hand</strong>
          <Hand hand={compHand} />
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Deck</strong>
          <div className={styles.deck}></div>
        </div>

        <div>
          <strong>Discard</strong>
          {discard.map((card, i) => (
            <CardDisplay mouseEnter={() => { }} mouseOut={() => { }} key={serializeCard(card)} card={card} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Player Hand</strong>
          <Hand hand={playerHand} />
        </div>
      </div>
    </div>
  );
}

export default App;
