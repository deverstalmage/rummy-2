import React, { useState, useEffect, useCallback } from "react";
import Hand from "./Hand";
import { Card, generateDeck, serializeCard, draw } from "./game";
import CardDisplay from "./Card";
import styles from "./App.module.css";
import { Helmet } from "react-helmet";

type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
  playerHand: Array<Card>;
  compHand: Array<Card>;
  turn: "player" | "comp";
  phase: "draw" | "discard" | "goOut";
  log: Array<string>;
};

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  const playerHand = draw(deck, 10);
  const compHand = draw(deck, 10);
  const turn = "player";
  const phase = "draw";
  const log = ["Player's turn", "Draw phase"];
  return {
    deck,
    discard,
    playerHand,
    compHand,
    turn,
    phase,
    log,
  };
}

function App() {
  const serializedGameState = localStorage.getItem("gameState");
  const gameState: GameState = serializedGameState
    ? (JSON.parse(serializedGameState) as GameState)
    : emptyGameState();
  const [deck] = useState(gameState.deck);
  const [discard, setDiscard] = useState(gameState.discard);
  const [playerHand, setPlayerHand] = useState(gameState.playerHand);
  const [compHand] = useState(gameState.compHand);
  const [turn] = useState(gameState.turn);
  const [action, setAction] = useState("");
  const [phase, setPhase] = useState(gameState.phase);
  const [logLines, setLogLines] = useState(gameState.log);

  const playerCanDraw = phase === "draw" && turn === "player";
  const playerCanDiscard = phase === "discard" && turn === "player";

  const log = useCallback(
    (newLine: string) => {
      setLogLines([...logLines, newLine]);
    },
    [logLines]
  );

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
        log: logLines,
      })
    );
    const buffer = document.getElementById("log");
    if (buffer) buffer.scrollTop = buffer.scrollHeight;

    if (playerHand.length > 10 && playerCanDraw) {
      log("Player discard phase");
      setPhase("discard");
    }
  }, [
    deck,
    discard,
    playerHand,
    compHand,
    turn,
    phase,
    logLines,
    playerCanDraw,
    log,
  ]);

  const resetAction = () => setAction("");

  const playerDeckDraw = () => {
    if (playerCanDraw) {
      const drawnCard = deck.pop();
      if (drawnCard) {
        log(`Player drew ${serializeCard(drawnCard)} from the deck`);
        setPlayerHand([...playerHand, drawnCard]);
      }
    }
  };

  const playerDiscardDraw = () => {
    if (playerCanDraw) {
      const drawnCard = discard.pop();
      if (drawnCard) {
        log(`Player drew ${serializeCard(drawnCard)} from the discard`);
        setPlayerHand([...playerHand, drawnCard]);
      }
    }
  };

  const playerDiscard = (card) => {
    if (playerCanDiscard) {
      log(`Player discarded ${serializeCard(card)}`);
      setPlayerHand(playerHand.filter((c) => c !== card));
      setDiscard([...discard, card]);
    }
  };

  const reload = () => {
    localStorage.removeItem("gameState");
    window.location.reload();
  };

  return (
    <div className={styles.game}>
      <Helmet>
        <title>{turn === "player" ? "Your turn!" : "Comp turn..."}</title>
      </Helmet>

      <div className={styles.section}>
        <div>
          <strong>Whose turn?</strong>
          <p>{turn}</p>
          <p>
            <button onClick={reload}>reload</button>
          </p>
        </div>
        <div>
          <strong>Turn phase?</strong>
          <p>{phase}</p>
        </div>
        <div>
          <strong>Action:</strong>
          <p>{action}</p>
        </div>

        <div>
          <strong>Log:</strong>
          <ul className={styles.log} id="log">
            {logLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
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
            className={`${styles.deck} ${
              playerCanDraw ? styles.clickable : ""
            }`}
            onMouseEnter={() => setAction("Draw from deck")}
            onMouseOut={resetAction}
            onClick={playerDeckDraw}
          ></div>
        </div>

        <div>
          <strong>Discard</strong>
          {discard.map((card, i) => (
            <CardDisplay
              notClickable={!playerCanDraw}
              mouseEnter={() =>
                setAction(`Draw ${serializeCard(card)} from discard`)
              }
              mouseOut={resetAction}
              key={serializeCard(card)}
              card={card}
              onClick={playerDiscardDraw}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div>
          <strong>Player Hand</strong>
          <Hand
            hand={playerHand}
            noClick={phase !== "discard"}
            onCardClick={playerDiscard}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
