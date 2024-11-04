import { CardType, PokemonCard, PowerType, Stage, State, StateUtils, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckRetreatCostEffect } from '../../game/store/effects/check-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class AbsolTEU extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.DARK;
  public hp: number = 100;
  public weakness = [{ type: CardType.FIGHTING }];
  public resistance = [{ type: CardType.PSYCHIC, value: -20 }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SSH';
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
      cost: [],  // [ CardType.DARK, CardType.COLORLESS, CardType.COLORLESS ],
      damage: 30,
      text: 'This attack does 30 more damage for each C in your opponent\'s Active Pokemon\'s Retreat Cost.'
    },
  ];
  public DARK_AMBITION_MARKER = 'DARK_AMBITION_MARKER';
  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Dark Ambition: +1 retreat cost for your opponent's Active Basic Pokemon
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.getPokemonCard()?.stage == Stage.BASIC) {
      const opponent = effect.player;
      const cardList = StateUtils.findCardList(state, this);
      const player = StateUtils.findOwner(state, cardList);
      const oppActiveCard: PokemonCard | undefined = opponent.active.getPokemonCard();
      if (opponent == player) { return state; }  // Make sure we're only operating on our opponent's active
      if (oppActiveCard == undefined) { return state; }
      if (opponent.marker.hasMarker(this.DARK_AMBITION_MARKER, oppActiveCard)) { return state; }  // Make sure we're not activating multiple times a turn
      
      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch { return state; }
      // If we're all good, add a C to the retreat cost
      opponent.marker.addMarker(this.DARK_AMBITION_MARKER, oppActiveCard);
      effect.cost = effect.cost.concat([ CardType.COLORLESS ]);
    }

    // Shadow Seeker
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const checkRetreatCost = new CheckRetreatCostEffect(effect.opponent);
      state = store.reduceEffect(state, checkRetreatCost);
      effect.damage += (30 * checkRetreatCost.cost.length);
    }

    if (effect instanceof EndTurnEffect) {
      StateUtils.getOpponent(state, effect.player).marker.removeMarker(this.DARK_AMBITION_MARKER);
    }

    return state;
  }
}