import React from 'react';
import { Card, serializeCard } from './game';
import styles from './Card.module.css';

export default function CardDisplay({ card }: { card: Card }) {
  return (
    <div className={styles.card}>
      {serializeCard(card)}
    </div>
  )
}