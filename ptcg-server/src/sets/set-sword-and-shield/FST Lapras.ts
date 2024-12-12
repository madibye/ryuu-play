import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, PlayerType, SlotType, Card, ChoosePokemonPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { SpecialCondition } from '../../game/store/card/card-types';
import { AddSpecialConditionsEffect, PutDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { StateUtils } from '../../game/store/state-utils';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class LaprasFST extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 120;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Icy Wind', 
      cost: [CardType.COLORLESS], 
      damage: 0, 
      text: 'Your opponent\'s Active Pokémon is now Asleep.' 
    },
    { 
      name: 'Splash Arch', 
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS], 
      damage: 0, 
      text: 'Put all Energy attached to this Pokémon into your hand. This attack does 100 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)' 
    }
  ];

  public set: string = 'SSH';

  public name: string = 'Lapras';

  public fullName: string = 'Lapras FST';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Icy Wind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      return store.reduceEffect(state, specialCondition);
    }

    // Splash Arch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
        
      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);
    
      const cards: Card[] = [];
      checkProvidedEnergy.energyMap.forEach(em => {
        cards.push(em.card);
      });
      
      player.active.moveCardsTo(cards, player.hand);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.TOP_PLAYER,
        [ SlotType.BENCH ],
        { allowCancel: false }
      ), result => {
        const damageTime = new PutDamageEffect(effect, 100);
        damageTime.target = result[0];
        store.reduceEffect(state, damageTime);
      });
    }

    return state;
  }
}