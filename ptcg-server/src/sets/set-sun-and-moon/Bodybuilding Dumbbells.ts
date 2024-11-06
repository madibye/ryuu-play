import { TrainerCard } from '../../game/store/card/trainer-card';
import { Stage, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { CheckHpEffect } from '../../game/store/effects/check-effects';

export class BodybuildingDumbbells extends TrainerCard {

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'SUM';

  public name: string = 'Bodybuilding Dumbbells';

  public fullName: string = 'Bodybuilding Dumbbells BUS';

  public text: string =
    'The Stage 1 Pokémon this card is attached to gets +40 HP.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.getPokemonCard()?.stage === Stage.STAGE_1 && effect.target.cards.includes(this)) {
      effect.hp += 40;
    }

    return state;
  }

}
