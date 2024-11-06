import { PokemonCard } from '../../game/store/card/pokemon-card';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Stage, CardType, CardTag, SuperType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, PlayerType, GameError } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';

export class EeveeEx extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex, CardTag.POKEMON_TERA ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 200;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [ CardType.COLORLESS ];

  public powers = [{
    name: 'Rainbow DNA',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'You can play Pokemon ex that evolve from Eevee onto this Pokemon to evolve it. (You can’t evolve this Pokemon during your first turn or during the turn you play it.) [Click this ability to use it]'
  }];

  public attacks = [
    {
      name: 'Quartz Shine',
      cost: [ CardType.FIRE, CardType.WATER, CardType.LIGHTNING ],
      damage: 200,
      text: ''
    }
  ];

  public set: string = 'SVI';

  public name: string = 'Eevee ex';

  public fullName: string = 'Eevee ex PRE';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {    
    // Rainbow DNA
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.hand.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const blocked = player.hand.cards
        .filter(c => !c.tags.includes(CardTag.POKEMON_ex))
        .map(c => player.deck.cards.indexOf(c));

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        if (cardList.pokemonPlayedTurn === state.turn){
          throw new GameError(GameMessage.CANNOT_USE_POWER);
        }

        if (cardList.getPokemonCard() === this) {
          return store.prompt(state, new ChooseCardsPrompt(
            player.id,
            GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
            player.hand,
            { superType: SuperType.POKEMON, evolvesFrom: 'Eevee' },
            { allowCancel: false, min: 0, max: 1, blocked }
          ), cards => {
            cards = cards || [];
            player.hand.moveCardsTo(cards, cardList);
            cardList.clearEffects();
            cardList.pokemonPlayedTurn = state.turn; 
          });
        }
      });
    }
      
    return state;
  }
}