import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Rellor extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 40;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Collect', cost: [CardType.COLORLESS], damage: 0, text: 'Draw a card.' },
    { name: 'Rollout', cost: [CardType.GRASS], damage: 10, text: '' }
  ];

  public set: string = 'SVI';

  public name: string = 'Rellor';

  public fullName: string = 'Rellor SSP';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Collect
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;
  
      player.deck.moveTo(player.hand, 1);
    }

    return state;
  }
}
