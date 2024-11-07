import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, EnergyType, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, GameError, GameMessage, EnergyCard, AttachEnergyPrompt, PlayerType, SlotType, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import {HealTargetEffect} from '../../game/store/effects/attack-effects';
import {CheckProvidedEnergyEffect} from '../../game/store/effects/check-effects';

export class LurantisGX extends PokemonCard {

  public tags = [ CardTag.POKEMON_GX ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Fomantis';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 210;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Flower Supply', 
      cost: [CardType.GRASS], 
      damage: 40, 
      text: 'Attach 2 basic Energy cards from your discard pile to your Pokémon in any way you like.' 
    },
    { 
      name: 'Solar Blade', 
      cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS], 
      damage: 120, 
      text: 'Heal 30 damage from this Pokemon' },
    { 
      name: 'Chloroscythe-GX', 
      cost: [CardType.GRASS], 
      damage: 50, 
      text: 'This attack does 50 damage times the amount of [G] Energy attached to this Pokémon. (You can\'t use more than 1 GX attack in a game.)' }
  ];

  public set: string = 'SSH';

  public name: string = 'Lurantis-GX';

  public fullName: string = 'Lurantis-GX SUM';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Flower Supply
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
            && c.energyType === EnergyType.BASIC;
      });
      if (!hasEnergyInDiscard) {
        return state;
      }
  
      state = store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_TO_BENCH,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [ SlotType.BENCH, SlotType.ACTIVE ],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
        { allowCancel: false, min: 0, max: 2 }
      ), transfers => {
        transfers = transfers || [];
        // cancelled by user
        if (transfers.length === 0) {
          return;
        }
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.discard.moveCardTo(transfer.card, target);
        }
      });
    }

    // Solar Blade
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
  
      const healTargetEffect = new HealTargetEffect(effect, 30);
      healTargetEffect.target = player.active;
      state = store.reduceEffect(state, healTargetEffect);
    }

    // Chloroscythe-GX
    if (effect instanceof AttackEffect && effect.attack === this.attacks[2]) {
      const player = effect.player;

      // Check if player has used GX attack
      if (player.usedGX == true) {
        throw new GameError(GameMessage.LABEL_GX_USED);
      }
      // set GX attack as used for game
      player.usedGX = true;
  
      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let energyCount = 0;
      checkProvidedEnergyEffect.energyMap.forEach(em => {
        energyCount += em.provides.filter(cardType => {
          return cardType === CardType.GRASS || cardType === CardType.ANY;
        }).length;
      });
      
      effect.damage = energyCount * 50;
    }

    return state;
  }
}