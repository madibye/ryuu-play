import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameError, GameMessage } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Doublade extends PokemonCard {

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Honedge';

  public cardType: CardType = CardType.METAL;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { name: 'Slash', cost: [CardType.COLORLESS], damage: 20, text: '' },
    { name: 'Slashing Strike', cost: [CardType.METAL, CardType.COLORLESS], damage: 80, text: 'During your next turn, this Pokémon can\'t use Slashing Strike.' },
  ];

  public set: string = 'SVI';

  public name: string = 'Doublade';

  public fullName: string = 'Doublade PAR';

  // for preventing the pokemon from attacking on the next turn
  public readonly ATTACK_USED_MARKER = 'ATTACK_USED_MARKER';
  public readonly ATTACK_USED_2_MARKER = 'ATTACK_USED_2_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      // Check marker
      if (effect.player.marker.hasMarker(this.ATTACK_USED_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
      effect.player.marker.addMarker(this.ATTACK_USED_MARKER, this);
    }

    // removing the markers for preventing the pokemon from attacking
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.ATTACK_USED_2_MARKER, this)) {
      effect.player.marker.removeMarker(this.ATTACK_USED_MARKER, this);
      effect.player.marker.removeMarker(this.ATTACK_USED_2_MARKER, this);
    }
  
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.ATTACK_USED_MARKER, this)) {
      effect.player.marker.addMarker(this.ATTACK_USED_2_MARKER, this);
    }

    return state;
  }

}
