import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, Card } from '../../game';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';
import { SpecialCondition } from '../../game/store/card/card-types';
import { ChoosePrizePrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Umbreonex extends PokemonCard {

  public tags = [CardTag.POKEMON_ex, CardTag.POKEMON_TERA];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Eevee';

  public cardType: CardType = CardType.DARK;

  public hp: number = 280;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Moon Mirage',
      cost: [CardType.DARK, CardType.COLORLESS, CardType.COLORLESS],
      damage: 160,
      text: 'Your opponent’s Active Pokémon is now Confused.'
    },
    {
      name: 'Euclase',
      cost: [CardType.LIGHTNING, CardType.PSYCHIC, CardType.DARK],
      damage: 0,
      text: 'Discard all Energy from this Pokémon. Draw 1 Prize card.'
    }
  ];

  public set: string = 'SVI';

  public name: string = 'Umbreon ex';

  public fullName: string = 'Umbreon ex PRE';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Moon Mirage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      return store.reduceEffect(state, specialCondition);
    }

    // Euclase
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      const cards: Card[] = [];
      checkProvidedEnergy.energyMap.forEach(em => {
        cards.push(em.card);
      });

      const discardEnergy = new DiscardCardsEffect(effect, cards);
      discardEnergy.target = player.active;
      store.reduceEffect(state, discardEnergy);

      return store.prompt(state, new ChoosePrizePrompt(
        player.id,
        GameMessage.CHOOSE_PRIZE_CARD,
        { count: 1, allowCancel: false }
      ), prizes => {
        prizes[0].moveTo(player.hand);
      });
    }

    return state;
  }
}