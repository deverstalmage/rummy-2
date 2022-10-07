import React from "react";
import { Card, serializeCard } from "./game";
import styles from "./Card.module.css";

export default function CardDisplay({
  card,
  mouseEnter = () => {},
  mouseOut = () => {},
  onClick = () => {},
  notClickable = false,
  deemphasized = false,
}: {
  card: Card;
  mouseEnter?: () => void;
  mouseOut?: () => void;
  notClickable?: boolean;
  onClick?: () => void;
  deemphasized?: boolean;
}) {
  return (
    <div
      key={serializeCard(card)}
      className={`${styles.card} ${notClickable ? "" : styles.clickable} ${
        deemphasized ? styles.deemph : ""
      }`}
      onMouseEnter={mouseEnter}
      onMouseOut={mouseOut}
      onClick={onClick}
    >
      {serializeCard(card)}
    </div>
  );
}
