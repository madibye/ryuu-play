import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Card, EnergyCard, ChooseEnergyPrompt, GameMessage } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';

export class DuraludonVIV extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.METAL;

  public hp: number = 130;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Raging Claws', 
      cost: [ CardType.COLORLESS, CardType.COLORLESS ], 
      damage: 20,
      text: 'This attack does 10 more damage for each damage counter on this Pokémon.' 
    },
    { 
      name: 'Power Blast', 
      cost: [ CardType.METAL, CardType.METAL, CardType.COLORLESS ], 
      damage: 120, 
      text: 'Discard an Energy from this Pokémon. ' 
    },
    
  ];

  public set: string = 'SSH';

  public name: string = 'Duraludon';

  public fullName: string = 'Duraludon VIV';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Raging Claws
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      effect.damage += player.active.damage;
    }

    // Power Blast
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
        
      if (!player.active.cards.some(c => c instanceof EnergyCard)) {
        return state;
      }

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [ CardType.COLORLESS ],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }
  
}