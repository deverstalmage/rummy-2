import React, { MouseEventHandler } from "react";
import { Card, serializeCard } from "./game";
import styles from "./Card.module.css";

export default function CardDisplay({
  card,
  mouseEnter = () => {},
  mouseOut = () => {},
  notClickable = false,
}: {
  card: Card;
  mouseEnter?: MouseEventHandler<HTMLDivElement>;
  mouseOut?: MouseEventHandler<HTMLDivElement>;
  notClickable?: boolean;
}) {
  return (
    <div
      key={serializeCard(card)}
      className={`${styles.card} ${notClickable ? "" : styles.clickable}`}
      onMouseEnter={mouseEnter}
      onMouseOut={mouseOut}
    >
      {serializeCard(card)}
    </div>
  );
}
