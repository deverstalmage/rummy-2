import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import { Card, generateDeck, serializeCard, draw } from "./game";
import CardDisplay from "./Card";
import styles from "./App.module.css";

type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
  playerHand: Array<Card>;
  compHand: Array<Card>;
  turn: "player" | "comp";
  phase: "draw" | "discard" | "goOut";
};

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  const playerHand = draw(deck, 10);
  const compHand = draw(deck, 10);
  const turn = "player";
  const phase = "draw";
  return {
    deck,
    discard,
    playerHand,
    compHand,
    turn,
    phase,
  };
}

function App() {
  const serializedGameState = localStorage.getItem("gameState");
  const gameState: GameState = serializedGameState
    ? (JSON.parse(serializedGameState) as GameState)
    : emptyGameState();
  const [deck] = useState(gameState.deck);
  const [discard] = useState(gameState.discard);
  const [playerHand] = useState(gameState.playerHand);
  const [compHand] = useState(gameState.compHand);
  const [turn] = useState(gameState.turn);
  const [action, setAction] = useState("");
  const [phase] = useState(gameState.phase);

  useEffect(() => {
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        deck,
        discard,
        playerHand,
        compHand,
        turn,
        phase,
      })
    );
  }, [deck, discard, playerHand, compHand, turn, phase]);

  const resetAction = () => setAction("");

  return (
    <div className={styles.game}>
      <div className={styles.section}>
        <div>
          <strong>Whose turn?</strong>
          <p>{turn}</p>
        </div>
        <div>
          <strong>Turn phase?</strong>
          <p>{phase}</p>
        </div>
        <div>
          <strong>Action:</strong>
          <p>{action}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Computer Hand</strong>
          <Hand hand={compHand} noClick={true} />
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Deck</strong>
          <div
            className={styles.deck}
            onMouseEnter={() => setAction("Draw from deck")}
            onMouseOut={resetAction}
          ></div>
        </div>

        <div>
          <strong>Discard</strong>
          {discard.map((card, i) => (
            <CardDisplay
              mouseEnter={() =>
                setAction(`Draw ${serializeCard(card)} from discard`)
              }
              mouseOut={resetAction}
              key={serializeCard(card)}
              card={card}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Player Hand</strong>
          <Hand hand={playerHand} noClick={phase !== "discard"} />
        </div>
      </div>
    </div>
  );
}

export default App;
