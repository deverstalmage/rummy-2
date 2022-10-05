import React, { MouseEventHandler } from 'react';
import { Card, serializeCard } from './game';
import styles from './Card.module.css';

export default function CardDisplay({ card, mouseEnter = () => { }, mouseOut = () => { } }: { card: Card, mouseEnter: MouseEventHandler<HTMLDivElement>, mouseOut: MouseEventHandler<HTMLDivElement> }) {
  return (
    <div key={serializeCard(card)} className={`${styles.card} ${styles.clickable}`} onMouseEnter={mouseEnter} onMouseOut={mouseOut}>
      {serializeCard(card)}
    </div>
  )
}