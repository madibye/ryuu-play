import { Card, CardType, ChooseEnergyPrompt, GameError, GameMessage, PokemonCard, PowerType, Stage, State, StoreLike } from '../../game';
import {CheckProvidedEnergyEffect} from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';

export class HolonsCastform extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [ CardType.COLORLESS ];

  public set = 'DP';

  public name = 'Holon\'s Castform';

  public fullName = 'Holon\'s Castform HP';

  public powers = [
    {
      name: '',
      powerType: PowerType.ABILITY,
      text: 'You may attach this as an Energy card from your hand to 1 of your Pokémon that already has an Energy card attached to it. When you attach this card, return an Energy card attached to that Pokémon to your hand. While attached, this card is a Special Energy card and provides every type of Energy but 2 Energy at a time. (Has no effect other than providing Energy.)'
    }
  ];

  public attacks = [
    { 
      name: 'Delta Draw', 
      cost: [CardType.COLORLESS], 
      damage: 0, 
      text: 'Does nothing right now :( (only because i\'m not fully working on RS-PK so we don\'t have Delta pokemon, so make sure to come back to this whoever decides to dedicate way too much time from their lives to RS-PK :) )' 
    }];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this && effect.target.cards.length !== 0) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, effect.target);
      store.reduceEffect(state, checkProvidedEnergy);

      let energyCount = 0;
      checkProvidedEnergy.energyMap.forEach(em => {
        energyCount += em.provides.length;
      });

      if (!energyCount){
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [ CardType.COLORLESS ],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        effect.target.moveCardsTo(cards, player.hand);
      });

      // moving it onto the pokemon
      effect.preventDefault = true;
      player.hand.moveCardTo(this, effect.target);
      // moving it to the back so it doesn't affect any evolution/name interactions 
      // this unfortunately doesn't make it show up as energy, but it works
      effect.target.cards.unshift(effect.target.cards.splice(effect.target.cards.length - 1, 1)[0]);
      
      return state;
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.cards.includes(this)){
      effect.energyMap.push({ card: this, provides: [ CardType.ANY, CardType.ANY ] });
    }

    return state;
  }
}