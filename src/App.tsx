import React, { useState, useEffect, useCallback } from "react";
import Hand from "./Hand";
import {
  Card,
  generateDeck,
  serializeCard,
  draw,
  calcDeadwood,
  totalValue,
  canPairOff,
  shouldDraw,
  bestDiscard,
  leastDeadwoodBeforeDiscard,
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
  phase: "draw" | "discard" | "maybeKnock" | "goOut" | "endOfRound";
  round: number;
  playerScore: number;
  compScore: number;
  wonLastRound: Turn | null;
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
  const wonLastRound = null;
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
    wonLastRound,
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
  const [wonLastRound, setWonLastRound] = useState(gameState.wonLastRound);

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
        round,
        playerScore,
        compScore,
        wonLastRound,
      })
    );
    const buffer = document.getElementById("log");
    if (buffer) buffer.scrollTop = buffer.scrollHeight;
  }, [
    deck,
    discard,
    playerHand,
    compHand,
    playerScore,
    compScore,
    turn,
    phase,
    round,
    wonLastRound,
  ]);

  const resetAction = () => setAction("");

  const playerHasGin = calcDeadwood(playerHand).deadwood.length === 0;

  const addPoints = useCallback(
    (who: Turn, points: number) => {
      if (who === "player") setPlayerScore(playerScore + points);
      else setCompScore(compScore + points);
    },
    [playerScore, compScore]
  );

  const scoreAndGoOut = useCallback(() => {
    const ender = turn;
    log(`${ender.toUpperCase()} is going out, round end.`);

    const opp = (["player", "comp"] as Array<Turn>).filter(
      (f) => f !== ender
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
      calcDeadwood(oppHand.filter((f) => !enderPairOffs.includes(f))).deadwood
    );

    const enderWasUndercut = enderScore >= oppScore;
    const enderHasGin = calcDeadwood(enderHand).deadwood.length === 0;
    const enderHasBigGin = enderHasGin && enderHand.length === 11;

    const winner = enderHasGin ? ender : enderWasUndercut ? opp : ender;

    const points = enderHasGin
      ? totalValue(calcDeadwood(oppHand).deadwood)
      : enderWasUndercut
      ? enderScore - oppScore
      : oppScore - enderScore;

    const extraPoints = enderHasBigGin
      ? 31
      : enderHasGin || enderWasUndercut
      ? 25
      : 0;

    if (enderHasBigGin) {
      log("Big gin!");
    } else if (enderHasGin) {
      log("Gin!");
    } else if (enderWasUndercut) {
      log(`${ender.toUpperCase()} was undercut (${enderScore} > ${oppScore})!`);
    } else {
      log(
        `Score with pair offs - ${ender}: ${enderScore}, ${opp}: ${oppScore}`
      );
    }

    if (extraPoints) {
      log(
        `${winner.toUpperCase()} wins, and gains ${points} + ${extraPoints} = ${
          points + extraPoints
        } points!`
      );
    } else {
      log(`${winner.toUpperCase()} wins, and gains ${points} points!`);
    }

    addPoints(winner, points + extraPoints);

    setPhase("endOfRound");
    setWonLastRound(winner);
  }, [addPoints, compHand, playerHand, turn]);

  const playerDrawFromDiscard = () => {
    const newDiscard = discard.slice();
    const drawnCard = newDiscard.pop();
    const newHand = [...playerHand, drawnCard];

    log(`PLAYER drew ${serializeCard(drawnCard)} from the discard`);
    setPlayerHand(newHand as Card[]);

    setDiscard(newDiscard);

    // check for big gin
    if (calcDeadwood(newHand).deadwood.length === 0) {
      setPhase("maybeKnock");
    } else {
      setPhase("discard");
    }
  };

  const playerDrawFromDeck = () => {
    const newDeck = deck.slice();
    const drawnCard = newDeck.pop();
    const newHand = [...playerHand, drawnCard];

    log(`PLAYER drew ${serializeCard(drawnCard)} from the deck`);
    setPlayerHand(newHand as Card[]);

    setDeck(newDeck);

    // check for big gin
    if (calcDeadwood(newHand).deadwood.length === 0) {
      setPhase("maybeKnock");
    } else {
      setPhase("discard");
    }
  };

  const playerDiscard = (card) => {
    if (playerCanDiscard) {
      log(`PLAYER discarded ${serializeCard(card)}`);
      const newHand = playerHand.filter((c) => c !== card);
      setPlayerHand(newHand);
      setDiscard([...discard, card]);

      if (totalValue(calcDeadwood(newHand).deadwood) <= 10) {
        setPhase("maybeKnock");
      } else {
        setTurn("comp");
        setPhase("draw");
      }
    }
  };

  const topOfDiscard = discard.slice(-1)[0];

  const computerTurn = useCallback(() => {
    const drawFromDiscard = shouldDraw(compHand, topOfDiscard);
    const newDiscard = discard.slice();
    const newDeck = deck.slice();
    const cardDrawn = drawFromDiscard ? newDiscard.pop() : newDeck.pop();

    if (drawFromDiscard) {
      log(`COMP drew ${serializeCard(cardDrawn)} from the discard`);
    } else {
      log(`COMP drew from the deck`);
    }

    let newCompHand = [...compHand, cardDrawn as Card];

    // check for big gin
    if (calcDeadwood(newCompHand).deadwood.length === 0) {
      // big gin! go out
      setPhase("goOut");
    } else {
      const discarded = bestDiscard(
        leastDeadwoodBeforeDiscard(newCompHand).deadwood,
        discard
      );

      newDiscard.push(discarded);
      newCompHand = newCompHand.filter((f) => f !== discarded) as Array<Card>;

      log(`COMP discarded ${serializeCard(discarded)}`);

      setDiscard(newDiscard);
      setCompHand(newCompHand);

      if (!drawFromDiscard) {
        setDeck(newDeck.filter((f) => f !== cardDrawn));
      }

      if (totalValue(calcDeadwood(newCompHand).deadwood) <= 10) {
        setPhase("goOut");
      } else {
        setTurn("player");
        setPhase("draw");
      }
    }
  }, [compHand, deck, discard, topOfDiscard]);

  const nextRound = useCallback(() => {
    log("Starting new round...");
    setRound(round + 1);
    const newDeck = generateDeck();
    setDiscard(draw(newDeck, 1));
    setPlayerHand(draw(newDeck, 10));
    setCompHand(draw(newDeck, 10));
    setDeck(newDeck);
    setTurn(wonLastRound as Turn);
    setPhase("draw");
  }, [round, wonLastRound]);

  useEffect(() => {
    // detect last discard of the phase and kick off computerTurn
    if (turn === "comp" && phase === "draw") computerTurn();
    else if (phase === "goOut") scoreAndGoOut();
  }, [phase, turn, computerTurn, scoreAndGoOut]);

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
          <p>round {round + 1}</p>
        </div>
        <div>
          <strong>Whose turn?</strong>
          <p>{turn.toUpperCase()}</p>
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
          <strong>COMP Hand</strong>
          <Hand
            hand={compHand}
            noClick={true}
            hideHand={phase !== "goOut" && phase !== "endOfRound"}
          />
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
            onClick={() => playerCanDraw && playerDrawFromDeck()}
          ></div>
          <div>{deck.length} cards</div>
        </div>

        <div>
          <strong>Discard</strong>
          {discard.length > 0 && (
            <CardDisplay
              notClickable={!playerCanDraw}
              mouseEnter={() =>
                playerCanDraw &&
                setAction(`Draw ${serializeCard(topOfDiscard)} from discard`)
              }
              mouseOut={resetAction}
              key={serializeCard(topOfDiscard)}
              card={topOfDiscard}
              onClick={() => playerCanDraw && playerDrawFromDiscard()}
            />
          )}
        </div>
      </div>

      <div className={styles.section}>
        {phase === "maybeKnock" && (
          <div>
            <button onClick={() => setPhase("goOut")}>
              {playerHasGin && playerHand.length === 11
                ? "Big Gin!!"
                : playerHasGin
                ? "Gin!"
                : "Knock?"}
            </button>
            {!(playerHasGin && playerHand.length === 11) && (
              <button
                onClick={() => {
                  setTurn("comp");
                  setPhase("draw");
                }}
              >
                Keep Playing
              </button>
            )}
          </div>
        )}

        {phase === "endOfRound" && playerScore >= 100 && compScore < 100 && (
          <div>
            <strong>PLAYER wins!</strong>
            <button onClick={reload}>restart</button>
          </div>
        )}
        {phase === "endOfRound" && compScore >= 100 && playerScore < 100 && (
          <div>
            <strong>COMP wins!</strong>
            <button onClick={reload}>restart</button>
          </div>
        )}
        {phase === "endOfRound" && compScore < 100 && playerScore < 100 && (
          <button onClick={nextRound}>Next round!</button>
        )}
      </div>

      <div className={styles.section}>
        <div>
          <strong>PLAYER Hand</strong>
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
