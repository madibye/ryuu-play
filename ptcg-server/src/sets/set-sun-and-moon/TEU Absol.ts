import { CardType, PlayerType, PokemonCard, PowerType, Stage, State, StateUtils, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class AbsolTEU extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.DARK;
  public hp: number = 100;
  public weakness = [{ type: CardType.FIGHTING }];
  public resistance = [{ type: CardType.PSYCHIC, value: -20 }];
  public retreat = [CardType.COLORLESS];
  public set = 'SUM';
  public name = 'Absol';
  public fullName = 'Absol TEU';
  public powers = [{
    name: 'Dark Ambition',
    powerType: PowerType.ABILITY,
    text: 'If your opponent\'s Active Pokemon is a Basic Pokemon, its Retreat Cost is C more.'
  }];
  public attacks = [
    {
      name: 'Shadow Seeker',
      cost: [CardType.DARK, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: 'This attack does 30 more damage for each C in your opponent\'s Active Pokemon\'s Retreat Cost.'
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Dark Ambition: +1 retreat cost for your opponent's Active Basic Pokemon
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.getPokemonCard()?.stage == Stage.BASIC) {
      const opponent = effect.player;
      const cardList = StateUtils.findCardList(state, this);
      const player = StateUtils.findOwner(state, cardList);
      let inPlay: boolean = false;

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => { if (card === this) { inPlay = true; } });
      if (opponent === player) { return state; }  // Make sure we're only operating on our opponent 
      if (!inPlay) { return state; }  // and only if this card is actually in play

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch { return state; }
      // If we're all good, add a C to the retreat cost
      effect.cost = effect.cost.concat([CardType.COLORLESS]);
    }

    // Shadow Seeker
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const checkRetreatCost = new CheckRetreatCostEffect(effect.opponent);
      state = store.reduceEffect(state, checkRetreatCost);
      effect.damage += (30 * checkRetreatCost.cost.length);
    }

    return state;
  }
}