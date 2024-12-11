import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class GougingFire extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 130;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    {
      name: 'Lunge Out',
      cost: [ CardType.FIRE ],
      damage: 30,
      text: ''
    },
    {
      name: 'Blazing Charge',
      cost: [ CardType.FIRE, CardType.FIRE, CardType.COLORLESS ],
      damage: 100,
      text: 'If your opponent has 4 or fewer Prize cards remaining, this attack does 70 more damage.'
    },    
  ];

  public set: string = 'SVI';

  public name: string = 'Gouging Fire';

  public fullName: string = 'Gouging Fire SSP';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Blazing Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.getPrizeLeft() <= 4){
        effect.damage += 70;
      }
    }
      
    return state;
  }
}