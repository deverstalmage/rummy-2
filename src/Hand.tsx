import React, { createRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
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
// import "./Hand.animations.css";

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
  const groupsWithRefs = groups.map((group) =>
    group.map((card) => ({ card, ref: createRef() }))
  );
  const deadwoodWithRefs = sortedCards(deadwood)
    .reverse()
    .map((card) => ({ card, ref: createRef() }));
  const handWithRefs = hand.map((card) => ({ card, ref: createRef() }));
  return (
    <div>
      {hideHand ? (
        <div>
          <TransitionGroup className={styles.group}>
            {handWithRefs.map(
              ({ card, ref }: { card: Card; ref: React.RefObject<any> }) => (
                <CSSTransition
                  key={serializeCard(card)}
                  nodeRef={ref}
                  timeout={2000}
                  classNames="card"
                >
                  <div ref={ref}>
                    <CardDisplay card={card} faceDown={true} />
                  </div>
                </CSSTransition>
              )
            )}
          </TransitionGroup>
          <strong>{hand.length} cards in hand</strong>
        </div>
      ) : (
        // <div>
        //   <div className={styles.group}>
        //     {hand.map((card) => (
        //       <CardDisplay card={card} faceDown={true} />
        //     ))}
        //   </div>
        //   <strong>{hand.length} cards in hand</strong>
        // </div>
        <div>
          <div className={styles.groups}>
            {groupsWithRefs.map((group, i) => (
              <div className={styles.group} key={JSON.stringify(group)}>
                <TransitionGroup className={styles.group} component={null}>
                  {group.map(
                    ({
                      card,
                      ref,
                    }: {
                      card: Card;
                      ref: React.RefObject<any>;
                    }) => {
                      return (
                        <CSSTransition
                          key={serializeCard(card)}
                          nodeRef={ref}
                          timeout={500}
                          classNames="card"
                        >
                          <div ref={ref}>
                            <CardDisplay
                              notClickable={noClick}
                              mouseEnter={() => onMouseEnterCard(card)}
                              mouseOut={() => onMouseOutCard(card)}
                              key={serializeCard(card)}
                              card={card}
                              onClick={() => onCardClick(card)}
                            />
                          </div>
                        </CSSTransition>
                      );
                    }
                  )}
                </TransitionGroup>
                {/* {group.map((card) => (
                  <CardDisplay
                    notClickable={noClick}
                    mouseEnter={() => onMouseEnterCard(card)}
                    mouseOut={() => onMouseOutCard(card)}
                    key={serializeCard(card)}
                    card={card}
                    onClick={() => onCardClick(card)}
                  />
                ))} */}
              </div>
            ))}
            <div className={styles.group}>
              {deadwoodWithRefs.map(({ card, ref }, i) => (
                <CSSTransition
                  key={serializeCard(card)}
                  nodeRef={ref}
                  timeout={500}
                  classNames="card"
                >
                  <div ref={ref}>
                    <CardDisplay
                      notClickable={noClick}
                      mouseEnter={() => onMouseEnterCard(card)}
                      mouseOut={() => onMouseOutCard(card)}
                      key={serializeCard(card)}
                      card={card}
                      onClick={() => onCardClick(card)}
                    />
                  </div>
                </CSSTransition>
                // <CardDisplay
                //   notClickable={noClick}
                //   mouseEnter={() => onMouseEnterCard(card)}
                //   mouseOut={() => onMouseOutCard(card)}
                //   key={serializeCard(card)}
                //   card={card}
                //   onClick={() => onCardClick(card)}
                // />
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
