import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';

export class NsReshiram extends PokemonCard {

  public tags = [ CardTag.N_POKEMON ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 130;

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Powerful Rage', 
      cost: [ CardType.FIRE, CardType.LIGHTNING ], 
      damage: 20, 
      text: 'This attack does 20 damage for each damage counter on this Pokémon.' 
    },

    { 
      name: 'Raging Hammer', 
      cost: [ CardType.FIRE, CardType.FIRE, CardType.LIGHTNING, CardType.COLORLESS ], 
      damage: 170, 
      text: '' 
    },
    
  ];

  public set: string = 'SVI';

  public name: string = 'N\'s Reshiram';

  public fullName: string = 'N\'s Reshiram SV9';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      effect.damage = player.active.damage * 2;
    }

    return state;
  }
  
}