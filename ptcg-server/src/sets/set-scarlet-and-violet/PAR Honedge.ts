import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike,State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';

export class Honedge extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.METAL;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Reckless Charge', cost: [CardType.METAL], damage: 30, text: 'This Pokémon also does 10 damage to itself.' }
  ];

  public set: string = 'SVI';

  public name: string = 'Honedge';

  public fullName: string = 'Honedge PAR';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      const damageEffect = new PutDamageEffect(effect, 10);
      damageEffect.target = player.active;
      store.reduceEffect(state, damageEffect);
    }

    return state;
  }

}
