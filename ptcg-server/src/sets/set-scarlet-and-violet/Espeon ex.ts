import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, Card, StateUtils, ChooseCardsPrompt, PlayerType, ShuffleDeckPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Espeonex extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex, CardTag.POKEMON_TERA ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Eevee';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 270;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -20 }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Psych Out', 
      cost: [CardType.PSYCHIC, CardType.COLORLESS, CardType.COLORLESS], 
      damage: 160,
      text: 'Discard 1 random card from your opponent’s hand.' },
    { 
      name: 'Amethyst', 
      cost: [CardType.GRASS, CardType.PSYCHIC, CardType.DARK], 
      damage: 0, 
      text: 'Devolve each of your opponent’s evolved Pokémon by shuffling the highest Stage Evolution card on it into your opponent’s deck.' }
  ];

  public set: string = 'SSH';

  public name: string = 'Espeon ex';

  public fullName: string = 'Espeon ex SV8a';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Psych Out
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      
      // Opponent has no cards in the hand
      if (opponent.hand.cards.length === 0) {
        return state;
      }
      
      let cards: Card[] = [];
      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DECK,
        opponent.hand,
        { },
        { min: 1, max: 1, allowCancel: false, isSecret: true }
      ), selected => {
        cards = selected || [];
        opponent.hand.moveCardsTo(cards, opponent.discard);
      });
    }

    // Amethyst
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card) => {
        if (card.stage === Stage.STAGE_1 || card.stage === Stage.STAGE_2) { 
          const pokemons = cardList.getPokemons();
          const latestEvolution = pokemons.slice(-1)[0];

          cardList.moveCardsTo([latestEvolution], opponent.deck);
          cardList.clearEffects();
        }
      });

      return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    return state;
  }
}