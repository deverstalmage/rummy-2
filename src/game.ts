export type Card = {
  value: number;
  suit: "club" | "spade" | "heart" | "diamond";
};

export type Hand = {
  groups: Array<Array<Card>>;
  deadwood: Array<Card>;
};

function displayCard(c) {
  let val;
  switch (c.value) {
    case 1:
      val = "A";
      break;
    case 11:
      val = "J";
      break;
    case 12:
      val = "Q";
      break;
    case 13:
      val = "K";
      break;
    default:
      val = c.value;
  }

  let s;
  switch (c.suit) {
    case "spade":
      s = "♠️";
      break;
    case "club":
      s = "♣️";
      break;
    case "heart":
      s = "♥️";
      break;
    case "diamond":
      s = "♦️";
      break;
    default:
      s = "";
      break;
  }

  return `${val}${s}`;
}

export const serializeCard = displayCard;

// function displayHand(hand) {
//   return {
//     groups: hand.groups.map(group => group.map(c => displayCard(c))),
//     deadwood: hand.deadwood.map(d => displayCard(d)),
//   };
// }

export function generateDeck(shuffled = true) {
  const deck: Array<Card> = [];
  for (let i = 1; i <= 13; i++) {
    deck.push({
      value: i,
      suit: "spade",
    });
    deck.push({
      value: i,
      suit: "club",
    });
    deck.push({
      value: i,
      suit: "heart",
    });
    deck.push({
      value: i,
      suit: "diamond",
    });
  }

  return shuffled
    ? deck.slice().sort((a, b) => 0.5 - Math.random())
    : deck.slice();
}

export function draw(deck: Array<Card>, n: number) {
  const r: Array<Card> = [];
  for (let i = 0; i < n; i++) {
    const c = deck.pop();
    if (c) r.push(c);
  }
  return r;
}

function cardValue(c) {
  if (c.value > 10) return 10;
  return c.value;
}

export function totalValue(cards) {
  let total = 0;
  for (const card of cards) {
    total = total + cardValue(card);
  }
  return total;
}

export function sortedCards(cs) {
  return cs.slice().sort((a, b) => {
    if (a.value !== b.value) return b.value - a.value;
    return a.suit.localeCompare(b.suit);
  });
}

function findAllRuns(hand) {
  let rest = sortedCards(hand).reverse();

  const runs: Array<Array<Card>> = [];

  for (const c of rest) {
    const h = rest.filter((f) => f.suit === c.suit);
    const otherSuits = rest.filter((f) => f.suit !== c.suit);

    for (const cr of h) {
      const idx = h.indexOf(cr);
      let lookAhead = idx;
      const currentRun = [h[lookAhead]];
      while (
        lookAhead < h.length - 1 &&
        h[lookAhead + 1].value === h[lookAhead].value + 1
      ) {
        currentRun.push(h[lookAhead + 1]);

        if (currentRun.length > 2) {
          runs.push([...currentRun]);
        }

        lookAhead++;
      }
    }

    rest = otherSuits;
  }

  return runs;
}

function findAllSets(hand) {
  let h = hand.slice();
  const sets: Array<Array<Card>> = [];

  for (const c of h) {
    const matches: Array<Card> = h.filter((f) => f.value === c.value);
    const rest = h.filter((f) => f.value !== c.value);

    if (matches.length >= 3) {
      sets.push(matches);
      if (matches.length === 4) {
        sets.push([matches[0], matches[1], matches[2]]);

        sets.push([matches[0], matches[2], matches[3]]);

        sets.push([matches[1], matches[2], matches[3]]);
      }
    }

    h = rest;
  }

  return sets;
}

function restOfHand(cards, hand) {
  return hand.filter((f) => !cards.includes(f));
}

function findAll(hand) {
  return [...findAllRuns(hand), ...findAllSets(hand)];
}

function findHands(
  hand,
  hands: Array<Hand> = [],
  g: Array<Array<Card>> = []
): Hand {
  const groups: Array<Array<Card>> = findAll(hand);
  for (const group of groups) {
    findHands(restOfHand(group, hand), hands, [...g, group]);
  }

  if (groups.length === 0) {
    hands.push({
      groups: g,
      deadwood: hand,
    });
  }

  return hand;
}

const eqSet = (xs, ys) =>
  xs.size === ys.size && [...xs].every((x) => ys.has(x));

// function getHandsBeforeDiscard(cards) {
//   const hands: Array<Hand> = [];
//   findHands(cards, hands);

//   const u = new Map();
//   hands.filter(f => f.deadwood.length > 0).forEach(hand => {
//     const s = new Set(hand.deadwood);
//     if (![...u.keys()].find(h => eqSet(h, s))) {
//       u.set(s, hand);
//     }
//   })
//   return [...u.values()];
// }

function highestValueCard(cards) {
  const c = cards.slice();
  let high = c[0];
  for (let i = 1; i < c.length; i++) {
    if (cardValue(c[i]) > cardValue(high)) {
      high = c[i];
    }
  }
  return high;
}

function removeHighestValueCard(cards) {
  const high = highestValueCard(cards);
  return cards.filter((f) => f !== high);
}

function leastDeadwoodBeforeDiscard(cards) {
  const hands: Array<Hand> = [];
  findHands(cards, hands);

  const u = new Map();
  hands
    .filter((f) => f.deadwood.length > 0)
    .forEach((hand) => {
      const s = new Set(hand.deadwood);
      if (![...u.keys()].find((h) => eqSet(h, s))) {
        u.set(s, hand);
      }
    });
  return [...u.values()].sort(
    (a, b) => totalValue(a.deadwood) - totalValue(b.deadwood)
  )[0];
}

export function calcDeadwood(cards): Hand {
  const hands: Array<Hand> = [];
  findHands(cards, hands);

  const u: Map<Set<Card>, Hand> = new Map();
  hands.forEach((hand) => {
    const s = new Set(hand.deadwood);
    if (![...u.keys()].find((h) => eqSet(h, s))) {
      u.set(s, hand);
    }
  });

  return [...u.values()].sort(
    (a, b) => totalValue(a.deadwood) - totalValue(b.deadwood)
  )[0];
}

export function bestDiscard(deadwood, discarded) {
  const highValueCard = highestValueCard(deadwood);
  const highestValueCards = deadwood.filter(
    (f) => cardValue(f) === cardValue(highValueCard)
  );
  const discardCandidates: Array<Card> = [];

  for (const h of highestValueCards) {
    if (discarded.length > 1) {
      const possibleHands: Array<Hand> = [];
      findHands([...discarded, h], possibleHands);
      if (possibleHands.flatMap((h) => h.groups).length > 0) {
        discardCandidates.push(h);
      }
    }

    // look for value pairs or 2 card runs
    const pair = highestValueCards.find(
      (f) => f.value === h.value && f.suit !== h.suit
    );
    const run = deadwood.find(
      (f) => f.value === h.value - 1 && f.suit === h.suit
    );

    if (!pair && !run) {
      discardCandidates.push(h);
    }
  }

  return discardCandidates.length > 0
    ? discardCandidates[0]
    : highestValueCards[0];
}

export function shouldDraw(currentHand, drawCard) {
  const newDeadwoodValue = totalValue(
    removeHighestValueCard(
      leastDeadwoodBeforeDiscard([...currentHand, drawCard]).deadwood
    )
  );
  const currentDeadwoodValue = totalValue(calcDeadwood(currentHand).deadwood);

  return newDeadwoodValue < currentDeadwoodValue;
}

// const testHand = [
//   { value: 1, suit: 'spade' },
//   { value: 1, suit: 'club' },
//   { value: 1, suit: 'diamond' },
//   { value: 1, suit: 'heart' },
//   { value: 2, suit: 'club' },
//   { value: 2, suit: 'diamond' },
//   { value: 2, suit: 'heart' },
//   { value: 3, suit: 'club' },
//   { value: 3, suit: 'diamond' },
//   { value: 3, suit: 'heart' },
// ];

// function run() {
//   const draw = (n) => [];
//   const compHand = draw(10);
//   const discard = draw(1);
//   const topOfDiscard = discard[discard.length - 1];
//   render('Comp Hand');
//   render(displayHand(calcDeadwood(compHand)));
//   render(`Top of Discard: ${displayCard(topOfDiscard)}`);
//   render(`All discarded: ${discard.map(d => displayCard(d)).reverse()}`);

//   const drawFromDiscard = shouldDraw(compHand, topOfDiscard);
//   render(`Should take from discard? ${drawFromDiscard ? 'Yes' : 'No'}`);

//   const cardDrawn = drawFromDiscard ? discard.pop() : shuffledDeck.pop();
//   render(`Drawing: ${displayCard(cardDrawn)}`);

//   let newCompHand = [...compHand, cardDrawn];
//   const discarded = bestDiscard(leastDeadwoodBeforeDiscard(newCompHand).deadwood, discard);
//   newCompHand = newCompHand.filter(f => f !== discarded);
//   discard.push(discarded);
//   render(`Discarding: ${displayCard(discarded)}`);

//   render('New comp hand');
//   render(displayHand(calcDeadwood(newCompHand)));

//   const canKnock = totalValue(calcDeadwood(newCompHand).deadwood) <= 10;
//   render(`Knock? ${canKnock ? 'Yes' : 'No'}`);
// }
