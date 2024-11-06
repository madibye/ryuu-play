import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';

// SCR Iron Boulder 71 (https://limitlesstcg.com/cards/SCR/71)
export class IronBoulder extends PokemonCard {

  public tags = [ CardTag.FUTURE ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 140;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { name: 'Adjusted Horn', 
      cost: [CardType.PSYCHIC, CardType.COLORLESS], 
      damage: 170, 
      text: 'If you don\'t have the same number of cards in your hand as your opponent, this attack does nothing.' 
    }
  ];

  public set: string = 'SCR';

  public name: string = 'Iron Boulder';

  public fullName: string = 'Iron Boulder SCR';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.hand.cards.length !== player.hand.cards.length){
        effect.damage = 0;
      }
    }

    return state;
  }
  
}