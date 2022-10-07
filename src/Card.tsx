import React from "react";
import { Card, serializeCard } from "./game";
import styles from "./Card.module.css";

export default function CardDisplay({
  card,
  mouseEnter = () => {},
  mouseOut = () => {},
  onClick = () => {},
  notClickable = false,
}: {
  card: Card;
  mouseEnter?: () => void;
  mouseOut?: () => void;
  notClickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      key={serializeCard(card)}
      className={`${styles.card} ${notClickable ? "" : styles.clickable}`}
      onMouseEnter={mouseEnter}
      onMouseOut={mouseOut}
      onClick={onClick}
    >
      {serializeCard(card)}
    </div>
  );
}
