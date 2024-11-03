import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import { Card, ChooseCardsPrompt, CoinFlipPrompt, EnergyCard, GameMessage, PlayerType } from '../../game';
import { StoreLike, State } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { DiscardCardsEffect, PutCountersEffect } from '../../game/store/effects/attack-effects';

function* useDestructiveBeam(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = effect.opponent;

  // Active Pokemon has no energy cards attached
  if (!opponent.active.cards.some(c => c instanceof EnergyCard)) {
    return state;
  }

  console.log('Has energy attached');
  
  // Flip the coin
  let flipResult = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    flipResult = result;
    next();
  });
  
  if (flipResult) { return state; } 
  
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(player.id, GameMessage.CHOOSE_CARD_TO_DISCARD, opponent.active,
    { superType: SuperType.ENERGY },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });
  
  const discardEnergy = new DiscardCardsEffect(effect, cards);
  discardEnergy.target = player.active;
  return store.reduceEffect(state, discardEnergy);
}
  

export class YveltalSFA extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.DARK;
  public hp: number = 120;
  public weakness = [{ type: CardType.LIGHTNING }];
  public resistance = [{ type: CardType.FIGHTING, value: -20 }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SSH';
  public name = 'Yveltal';
  public fullName = 'Yveltal SFA';
  public attacks = [
    {
      name: 'Corrosive Winds',
      cost: [ CardType.DARK ],
      damage: 0,
      text: 'Put 2 damage counters on each of your opponent\'s Pokemon that has any damage counters on it.'
    },
    {
      name: 'Destructive Beam',
      cost: [ 
        //CardType.DARK, CardType.DARK, CardType.COLORLESS 
      ],
      damage: 100,
      text: 'Flip a coin. If heads, discard an Energy from your opponent\'s Active Pokemon.'
    },
  ];
  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Corrosive Winds
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card) => {
        if ((cardList.damage > 0)) {
          const putCountersEffect = new PutCountersEffect(effect, 20);
          putCountersEffect.target = cardList;
          store.reduceEffect(state, putCountersEffect);
        }
      });
    }

    // Destructive Beam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useDestructiveBeam(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}