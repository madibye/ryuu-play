import { Effect } from '../../game/store/effects/effect';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StateUtils } from '../../game/store/state-utils';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { Player } from '../../game';

export class JasminesGaze extends TrainerCard {

  public trainerType: TrainerType = TrainerType.SUPPORTER;
  public set: string = 'SVI';
  public name: string = 'Jasmine\'s Gaze';
  public fullName: string = 'Jasmine\'s Gaze SSP';
  public text: string = 'During your opponent\'s next turn, all of your Pokemon take 30 less damage ' +
  'from attacks from your opponent\'s Pokemon (after applying Weakness and Resistance). ' +
  '(This includes new Pokemon that come into play.)';
  
  private readonly JASMINES_GAZE_MARKER = 'JASMINES_GAZE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      effect.player.marker.addMarker(this.JASMINES_GAZE_MARKER, this);
    }

    if (effect instanceof PutDamageEffect) {
      const player: Player = StateUtils.findOwner(state, StateUtils.findCardList(state, this));
      const hasMarker: boolean = player.marker.hasMarker(this.JASMINES_GAZE_MARKER, this);
      if (hasMarker) { effect.damage -= 30; }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      StateUtils.getOpponent(state, effect.player).marker.removeMarker(this.JASMINES_GAZE_MARKER);
    }

    return state;
  }

}
