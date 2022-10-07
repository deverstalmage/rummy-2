import React, { MouseEventHandler } from "react";
import { Card, Hand, calcDeadwood, serializeCard, sortedCards } from "./game";
import CardDisplay from "./Card";
import styles from "./Hand.module.css";

export default function HandComponent({
  hand,
  noClick = false,
  onMouseEnterCard = () => {},
  onMouseOutCard = () => {},
}: {
  hand: Array<Card>;
  noClick?: boolean;
  onMouseEnterCard?: (card: Card) => void;
  onMouseOutCard?: (card: Card) => void;
}) {
  const { groups, deadwood }: Hand = calcDeadwood(hand);
  return (
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
              />
            ))}
        </div>
      </div>
    </div>
  );
}
