import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils, PowerType, PokemonCardList, GamePhase, GameLog, Player } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, CoinFlipEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

function simulateCoinFlip(store: StoreLike, state: State, player: Player): boolean {
  const result = Math.random() < 0.5;
  const gameMessage = result ? GameLog.LOG_PLAYER_FLIPS_HEADS : GameLog.LOG_PLAYER_FLIPS_TAILS;
  store.log(state, gameMessage, { name: player.name });
  return result;
}

export class FezandipitiTWM extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 120;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public powers = [{
    name: 'Adrena-Pheromone',
    powerType: PowerType.ABILITY,
    text: 'If this Pokemon has any D Energy attached and is damaged by an attack, flip a coin. If heads, prevent that damage.',
  }];

  public attacks = [
    {
      name: 'Energy Feather',
      cost: [CardType.PSYCHIC],
      damage: 30,
      text: 'This attack does 30 damage for each Energy attached to this Pokemon.'
    },
  ];

  public set: string = 'SVI';

  public name: string = 'Fezandipiti';

  public fullName: string = 'Fezandipiti TWM';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Adrena-Pheromone
    if (effect instanceof PutDamageEffect) {
      const player = effect.player;
      const opponent = effect.opponent;
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      // Only blocks damage from attacks
      if (effect.target !== cardList || state.phase !== GamePhase.ATTACK) { return state; }

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      // Check if we have dark energy attached
      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, cardList);
      store.reduceEffect(state, checkProvidedEnergyEffect);
      let hasDarkEnergy: boolean = false;
      checkProvidedEnergyEffect.energyMap.forEach(
        energy => { energy.provides.forEach(e => { if (e == CardType.DARK) { hasDarkEnergy = true; } }); }
      );
      if (!hasDarkEnergy) { return state; }

      // Flip a coin, and if heads, prevent damage.
      try {
        const coinFlip = new CoinFlipEffect(player);
        store.reduceEffect(state, coinFlip);
      } catch {
        return state;
      }

      const coinFlipResult = simulateCoinFlip(store, state, player);

      if (!coinFlipResult) {
        effect.damage = 0;
        store.log(state, GameLog.LOG_ABILITY_BLOCKS_DAMAGE, { name: opponent.name, pokemon: this.name });
      }
    }

    // Energy Feather
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, cardList);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let energies: number = 0;
      checkProvidedEnergyEffect.energyMap.forEach(energy => { energy.provides.forEach(e => { energies++; }); });
      effect.damage = 30 * energies;
    }
    return state;
  }
}