import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import {
  Card,
  generateDeck,
  serializeCard,
  draw,
  calcDeadwood,
  totalValue,
} from "./game";
import CardDisplay from "./Card";
import styles from "./App.module.css";
import { Helmet } from "react-helmet";

type GameState = {
  deck: Array<Card>;
  discard: Array<Card>;
  playerHand: Array<Card>;
  compHand: Array<Card>;
  turn: "player" | "comp";
  phase: "draw" | "discard" | "maybeKnock" | "goOut";
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
  const [discard, setDiscard] = useState(gameState.discard);
  const [playerHand, setPlayerHand] = useState(gameState.playerHand);
  const [compHand] = useState(gameState.compHand);
  const [turn, setTurn] = useState(gameState.turn);
  const [action, setAction] = useState("");
  const [phase, setPhase] = useState(gameState.phase);

  const playerCanDraw = phase === "draw" && turn === "player";
  const playerCanDiscard = phase === "discard" && turn === "player";

  const log = (newLine: string) => {
    const buffer = document.getElementById("log");

    if (buffer) {
      const li = document.createElement("li");
      li.textContent = newLine;
      buffer.appendChild(li);
    }
  };

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
    const buffer = document.getElementById("log");
    if (buffer) buffer.scrollTop = buffer.scrollHeight;
  }, [deck, discard, playerHand, compHand, turn, phase]);

  const resetAction = () => setAction("");

  const playerHasGin = calcDeadwood(playerHand).deadwood.length === 0;

  const scoreAndGoOut = () => {
    setPhase("goOut");

    const playerScore = totalValue(
      calcDeadwood([
        ...calcDeadwood(playerHand).deadwood,
        ...calcDeadwood(compHand).groups.flatMap((c) => c),
      ]).deadwood
    );

    const compScore = totalValue(
      calcDeadwood([
        ...calcDeadwood(compHand).deadwood,
        ...calcDeadwood(playerHand).groups.flatMap((c) => c),
      ]).deadwood
    );

    log(`${turn} is going out, round end.`);

    //undercut?
    const undercut =
      turn === "player" ? playerScore >= compScore : compScore >= playerScore;

    if (turn === "player") {
      if (playerHasGin) {
        const points = totalValue(calcDeadwood(compHand).deadwood);
        if (playerHand.length === 11) {
          log("Big gin!");
          log(`Player wins and gains ${points} + 31 = ${points + 31} points!`);
        } else {
          log("Gin!");
          log(`Player wins and gains ${points} + 25 = ${points + 25} points!`);
        }
      } else if (undercut) {
        log("Player was undercut!");
        log(
          `Comp wins the hand and gains ${playerScore - compScore + 25} points`
        );
      } else {
        log(
          `Score with pair offs - Player: ${playerScore}, Comp: ${compScore}`
        );
        log(
          `Player wins the hand, and gains ${compScore - playerScore} points`
        );
      }
    } else {
      if (calcDeadwood(compHand).deadwood.length === 0) {
        const points = totalValue(calcDeadwood(playerHand).deadwood);
        if (compHand.length === 11) {
          log("Big gin!");
          log(`Comp wins and gains ${points} + 31 = ${points + 31} points!`);
        } else {
          log("Gin!");
          log(`Comp wins and gains ${points} + 25 = ${points + 25} points!`);
        }
      } else if (undercut) {
        log("Comp was undercut!");
        log(
          `Player wins the hand and gains ${
            compScore - playerScore + 25
          } points`
        );
      } else {
        log(
          `Score with pair offs - Player: ${playerScore}, Comp: ${compScore}`
        );
        log(`Comp wins the hand, and gains ${playerScore - compScore} points`);
      }
    }
  };

  const drawFrom = (cardSource: Array<Card>) => {
    if (playerCanDraw) {
      const drawnCard = cardSource.pop();
      if (drawnCard) {
        const newHand = [...playerHand, drawnCard];
        log(`Player drew ${serializeCard(drawnCard)} from the deck`);
        setPlayerHand(newHand);

        // check for big gin
        if (calcDeadwood(newHand).deadwood.length === 0) {
          setPhase("maybeKnock");
        } else {
          setPhase("discard");
        }
      }
    }
  };

  const playerDeckDraw = () => drawFrom(deck);
  const playerDiscardDraw = () => drawFrom(discard);

  const playerDiscard = (card) => {
    if (playerCanDiscard) {
      alert(`Player discarded ${serializeCard(card)}`);
      log(`Player discarded ${serializeCard(card)}`);
      const newHand = playerHand.filter((c) => c !== card);
      setPlayerHand(newHand);
      setDiscard([...discard, card]);

      if (totalValue(calcDeadwood(newHand).deadwood) <= 10) {
        setPhase("maybeKnock");
      } else {
        computerTurn();
      }
    }
  };

  const computerTurn = () => {
    log("Computer's turn");
    setTurn("comp");
    setPhase("draw");
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
          <ul className={styles.log} id="log"></ul>
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

      {phase === "maybeKnock" && (
        <div className={styles.section}>
          <button onClick={scoreAndGoOut}>
            {playerHasGin && playerHand.length === 11
              ? "Big Gin!!"
              : playerHasGin
              ? "Gin!"
              : "Knock?"}
          </button>
          <button onClick={computerTurn}>Keep Playing</button>
        </div>
      )}

      <div className={styles.section}>
        <div>
          <strong>Player Hand</strong>
          <Hand
            hand={playerHand}
            noClick={phase !== "discard"}
            onMouseEnterCard={(card) =>
              phase === "discard" && setAction(`Discard ${serializeCard(card)}`)
            }
            onMouseOutCard={resetAction}
            onCardClick={playerDiscard}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
