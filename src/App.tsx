import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import {
  Card,
  generateDeck,
  serializeCard,
  draw,
  calcDeadwood,
  totalValue,
  canPairOff,
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
  round: number;
  playerScore: number;
  compScore: number;
};

type Turn = "player" | "comp";

function emptyGameState(): GameState {
  const deck = generateDeck();
  const discard = draw(deck, 1);
  const playerHand = draw(deck, 10);
  const compHand = draw(deck, 10);
  const turn = "player";
  const phase = "draw";
  const round = 0;
  const playerScore = 0;
  const compScore = 0;
  return {
    deck,
    discard,
    playerHand,
    compHand,
    turn,
    phase,
    round,
    playerScore,
    compScore,
  };
}

function App() {
  const serializedGameState = localStorage.getItem("gameState");
  const gameState: GameState = serializedGameState
    ? (JSON.parse(serializedGameState) as GameState)
    : emptyGameState();
  const [deck, setDeck] = useState(gameState.deck);
  const [discard, setDiscard] = useState(gameState.discard);
  const [playerHand, setPlayerHand] = useState(gameState.playerHand);
  const [compHand, setCompHand] = useState(gameState.compHand);
  const [turn, setTurn] = useState(gameState.turn);
  const [action, setAction] = useState("");
  const [phase, setPhase] = useState(gameState.phase);
  const [round, setRound] = useState(gameState.round);
  const [playerScore, setPlayerScore] = useState(gameState.playerScore);
  const [compScore, setCompScore] = useState(gameState.compScore);

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

  const nextRound = (winner: Turn) => {
    setRound(round + 1);
    const newDeck = generateDeck();
    setDeck(generateDeck());
    setDiscard(draw(newDeck, 1));
    setPlayerHand(draw(newDeck, 10));
    setCompHand(draw(newDeck, 10));
    setTurn(winner);
    setPhase("draw");
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
        round,
      })
    );
    const buffer = document.getElementById("log");
    if (buffer) buffer.scrollTop = buffer.scrollHeight;
  }, [deck, discard, playerHand, compHand, turn, phase, round]);

  const resetAction = () => setAction("");

  const playerHasGin = calcDeadwood(playerHand).deadwood.length === 0;

  const addPoints = (who: Turn, points: number) => {
    if (who === "player") setPlayerScore(playerScore + points);
    else setCompScore(compScore + points);
  };

  const scoreAndGoOut = () => {
    setPhase("goOut");
    log(`${turn} is going out, round end.`);

    const ender = turn;
    const opp = (["player", "comp"] as Array<Turn>).filter(
      (f) => f === ender
    )[0];
    const { groups: enderGroups, deadwood: enderDeadwood } =
      calcDeadwood(playerHand);
    const { groups: oppGroups, deadwood: oppDeadwood } =
      calcDeadwood(playerHand);
    const enderHand = turn === "player" ? playerHand : compHand;
    const oppHand = turn === "player" ? compHand : playerHand;
    const enderPairOffs = enderDeadwood.filter((f) => canPairOff(oppGroups, f));
    const oppPairOffs = oppDeadwood.filter((f) => canPairOff(enderGroups, f));
    const enderScore = totalValue(
      calcDeadwood(enderHand.filter((f) => !oppPairOffs.includes(f))).deadwood
    );
    const oppScore = totalValue(
      calcDeadwood(enderHand.filter((f) => !enderPairOffs.includes(f))).deadwood
    );
    const wasUndercut = enderScore >= oppScore;
    const enderHasGin = calcDeadwood(enderHand).deadwood.length === 0;
    const enderHasBigGin = enderHasGin && enderHand.length === 11;
    const winner = enderHasGin ? ender : wasUndercut ? opp : ender;

    const points = enderHasGin
      ? totalValue(calcDeadwood(oppHand).deadwood)
      : wasUndercut
      ? enderScore - oppScore
      : oppScore - enderScore;

    const extraPoints = enderHasBigGin
      ? 31
      : enderHasGin || wasUndercut
      ? 25
      : 0;

    if (enderHasBigGin) {
      log("Big gin!");
    } else if (enderHasGin) {
      log("Gin!");
    } else if (wasUndercut) {
      log(`${ender} was undercut (${enderScore} > ${oppScore})!`);
    } else {
      log(`Score with pair offs - Player: ${playerScore}, Comp: ${compScore}`);
    }

    if (extraPoints) {
      log(
        `${winner} wins, and gains ${points} + ${extraPoints} = ${
          points + extraPoints
        } points!`
      );
    } else {
      log(`${winner} wins, and gains ${points} points!`);
    }

    addPoints(winner, points + extraPoints);

    nextRound(winner);
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
        <title>Gin Rummy, baby!</title>
      </Helmet>

      <div className={styles.section}>
        <div>
          <strong>Score:</strong>
          <p>Player: {playerScore}</p>
          <p>Comp: {compScore}</p>
        </div>
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
            onMouseEnter={() => playerCanDraw && setAction("Draw from deck")}
            onMouseOut={resetAction}
            onClick={playerDeckDraw}
          ></div>
        </div>

        <div>
          <strong>Discard</strong>
          {discard.length > 0 && (
            <CardDisplay
              notClickable={!playerCanDraw}
              mouseEnter={() =>
                playerCanDraw &&
                setAction(
                  `Draw ${serializeCard(
                    discard[discard.length - 1]
                  )} from discard`
                )
              }
              mouseOut={resetAction}
              key={serializeCard(discard[discard.length - 1])}
              card={discard[discard.length - 1]}
              onClick={playerDiscardDraw}
            />
          )}
          {/* {discard.map((card, i) => (
            <CardDisplay
              notClickable={!playerCanDraw}
              mouseEnter={() =>
                playerCanDraw &&
                setAction(`Draw ${serializeCard(card)} from discard`)
              }
              mouseOut={resetAction}
              key={serializeCard(card)}
              card={card}
              onClick={playerDiscardDraw}
            />
          ))} */}
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
          {!(playerHasGin && playerHand.length === 11) && (
            <button onClick={computerTurn}>Keep Playing</button>
          )}
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
