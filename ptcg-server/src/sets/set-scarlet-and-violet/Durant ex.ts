import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, StateUtils, ConfirmPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import {PlayPokemonEffect} from '../../game/store/effects/play-card-effects';

export class DurantEx extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 190;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Sudden Scrape',
    useWhenInPlay: false,
    powerType: PowerType.ABILITY,
    text: 'When you play this Pokemon from your hand onto your Bench during your turn, you may use this ability. Discard the top card of your opponent\'s deck.'
  }];

  public attacks = [
    {
      name: 'Revenge Crush',
      cost: [ CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS ],
      damage: 120,
      text: 'This attack does 30 more damage for each Prize Card your opponent has taken.'
    }
  ];

  public set: string = 'SSH';

  public name: string = 'Durant ex';

  public fullName: string = 'Durant ex SV8a';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {    
    // Sudden Scrape
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
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
          opponent.deck.moveTo(opponent.discard, 1);
        }});
    }
    
    // Revenge Crush
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      effect.damage += (6 - opponent.getPrizeLeft()) * 30;
    }
      
    return state;
  }
}