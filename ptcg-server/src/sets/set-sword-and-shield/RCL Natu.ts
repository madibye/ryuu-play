import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';

// RCL Natu 76 (https://limitlesstcg.com/cards/RCL/76)
export class Natu extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 60;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Me First', cost: [ CardType.COLORLESS ], damage: 0, text: 'Draw a card.' }
  ];

  public set: string = 'RCL';

  public name: string = 'Natu';

  public fullName: string = 'Natu RCL';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      player.deck.moveTo(player.hand, 2);
    }

    return state;
  }
  
}