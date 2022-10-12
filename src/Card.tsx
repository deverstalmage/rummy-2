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
  faceDown = false,
}: {
  card: Card;
  mouseEnter?: () => void;
  mouseOut?: () => void;
  notClickable?: boolean;
  onClick?: () => void;
  deemphasized?: boolean;
  faceDown?: boolean;
}) {
  return faceDown ? (
    <div className={`${styles.faceDown} ${styles.card}`}></div>
  ) : (
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
