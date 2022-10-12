import React from "react";
import {
  Card,
  Hand,
  calcDeadwood,
  serializeCard,
  sortedCards,
  totalValue,
} from "./game";
import CardDisplay from "./Card";
import styles from "./Hand.module.css";
import { group } from "console";

export default function HandComponent({
  hand,
  noClick = false,
  onMouseEnterCard = () => {},
  onMouseOutCard = () => {},
  onCardClick = () => {},
  hideHand = false,
}: {
  hand: Array<Card>;
  noClick?: boolean;
  onMouseEnterCard?: (card: Card) => void;
  onMouseOutCard?: (card: Card) => void;
  onCardClick?: (card: Card) => void;
  hideHand?: boolean;
}) {
  const { groups, deadwood }: Hand = calcDeadwood(hand);
  return (
    <div>
      {hideHand ? (
        <div>
          <div className={styles.group}>
            {hand.map((card) => (
              <CardDisplay card={card} faceDown={true} />
            ))}
          </div>
          <strong>{hand.length} cards in hand</strong>
        </div>
      ) : (
        <div>
          <div className={styles.groups}>
            {groups.map((group, i) => (
              <div className={styles.group} key={JSON.stringify(group)}>
                {group.map((card) => (
                  <CardDisplay
                    notClickable={noClick}
                    mouseEnter={() => onMouseEnterCard(card)}
                    mouseOut={() => onMouseOutCard(card)}
                    key={serializeCard(card)}
                    card={card}
                    onClick={() => onCardClick(card)}
                  />
                ))}
              </div>
            ))}
            <div className={styles.group}>
              {sortedCards(deadwood)
                .reverse()
                .map((card, i) => (
                  <CardDisplay
                    notClickable={noClick}
                    mouseEnter={() => onMouseEnterCard(card)}
                    mouseOut={() => onMouseOutCard(card)}
                    key={serializeCard(card)}
                    card={card}
                    onClick={() => onCardClick(card)}
                  />
                ))}
            </div>
          </div>
          <div>deadwood value: {totalValue(calcDeadwood(hand).deadwood)}</div>
          <strong>{hand.length} cards in hand</strong>
        </div>
      )}
    </div>
  );
}
