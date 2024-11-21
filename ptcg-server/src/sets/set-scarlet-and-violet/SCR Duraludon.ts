import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';

export class Duraludon extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.METAL;

  public hp: number = 130;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Hammer In', 
      cost: [ CardType.METAL ], 
      damage: 30, 
      text: '' 
    },

    { 
      name: 'Raging Hammer', 
      cost: [ CardType.METAL, CardType.METAL, CardType.COLORLESS ], 
      damage: 80, 
      text: 'This attack does 10 more damage for each damage counter on this Pokémon.' 
    },
    
  ];

  public set: string = 'SVI';

  public name: string = 'Duraludon';

  public fullName: string = 'Duraludon SCR';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;

      effect.damage += player.active.damage;
    }

    return state;
  }
  
}