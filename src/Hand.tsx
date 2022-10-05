import React from 'react';
import { Card, Hand, calcDeadwood, serializeCard } from './game';
import CardDisplay from './Card';
import styles from './Hand.module.css';

export default function HandComponent({ hand }: { hand: Array<Card> }) {
  const { groups, deadwood }: Hand = calcDeadwood(hand);
  return (
    <div>
      <div className={styles.groups}>
        {groups.map(group => (
          <div className={styles.group} key={JSON.stringify(group)}>
            {group.map(card => (
              <CardDisplay key={serializeCard(card)} card={card} />
            ))}
          </div>
        ))}
        <div className={styles.group}>
          {deadwood.map(card => (
            <CardDisplay key={serializeCard(card)} card={card} />
          ))}
        </div>
      </div>
    </div>
  )
}