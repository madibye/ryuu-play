import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Stage, CardType, SuperType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, PlayerType, ConfirmPrompt, EnergyType, GameError, EnergyCard } from '../../game';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { StateUtils } from '../../game/store/state-utils';
import { PowerEffect, AttackEffect } from '../../game/store/effects/game-effects';

// CES Rayquaza-GX 109 (https://limitlesstcg.com/cards/CES/109)
export class RayquazaGX extends PokemonCard {

  public tags = [ CardTag.POKEMON_GX ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 180;

  public weakness = [{ type: CardType.FAIRY }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Stormy Winds',
    useWhenInPlay: false,
    powerType: PowerType.ABILITY,
    text: 'When you play this Pokémon from your hand onto your Bench during your turn, you may discard the top 3 cards of your deck. If you do, attach a basic Energy card from your discard pile to this Pokémon.'
  }];

  public attacks = [
    {
      name: 'Dragon Break',
      cost: [ CardType.GRASS, CardType.LIGHTNING, CardType.COLORLESS ],
      damage: 30,
      text: 'This attack does 30 damage times the amount of basic [G] and basic [L] Energy attached to your Pokémon.'
    },
  
    {
      name: 'Tempest-GX',
      cost: [ CardType.GRASS ],
      damage: 0,
      text: 'Discard your hand and draw 10 cards. (You can\'t use more than 1 GX attack in a game.)'
    }
  ];

  public set: string = 'SUM';

  public name: string = 'Rayquaza-GX';

  public fullName: string = 'Rayquaza-GX CES';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Stormy Winds
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }
  
      state = store.prompt(state, new ConfirmPrompt(
        effect.player.id,
        GameMessage.WANT_TO_USE_ABILITY,
      ), wantToUse => {
        if (wantToUse) {
          
          // checking if there's energy in the discard
          const hasEnergyInDiscard = player.discard.cards.some(c => {
            return c instanceof EnergyCard
              && c.energyType === EnergyType.BASIC
              && (c.provides.includes(CardType.GRASS) || c.provides.includes(CardType.LIGHTNING));
          }); 
          player.deck.moveTo(player.discard, 3);
          if (hasEnergyInDiscard){
            const cardList = StateUtils.findCardList(state, this);
            if (cardList === undefined) {
              return state;
            }

            return store.prompt(state, new ChooseCardsPrompt(
              player.id,
              GameMessage.CHOOSE_CARD_TO_ATTACH,
              player.discard,
              { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
              { min: 1, max: 1, allowCancel: true }
            ), cards => {
              cards = cards || [];
              if (cards.length > 0) {
                player.discard.moveCardsTo(cards, cardList);
              }
            });
          }
        }});
    }
    
    // Dragon Break
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let energies = 0;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, cardList);
        store.reduceEffect(state, checkProvidedEnergyEffect);
        checkProvidedEnergyEffect.energyMap.forEach(energy => {
          if (energy.provides.includes(CardType.LIGHTNING) || energy.provides.includes(CardType.GRASS)) {
            energies += 1;
          }
        });
      });

      effect.damage = energies * 30;
    }
    // Tempest-GX
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      // Check if player has used GX attack
      if (player.usedGX == true) {
        throw new GameError(GameMessage.LABEL_GX_USED);
      }
      // set GX attack as used for game
      player.usedGX = true;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const cards = player.hand.cards.filter(c => c !== this);
      player.hand.moveCardsTo(cards, player.discard);
      player.deck.moveTo(player.hand, 10);
    }
    return state;
  }
}