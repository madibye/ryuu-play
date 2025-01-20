import { TrainerCard } from '../../game/store/card/trainer-card';
import { CardTag, Stage, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike, State, ChooseCardsPrompt, GameMessage, GameError, Card, PokemonCardList, ShuffleDeckPrompt, PokemonCard } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';


export class HopsBag extends TrainerCard {
  public trainerType: TrainerType = TrainerType.ITEM;
  public set: string = 'SV9';
  public name: string = 'Hop\'s Bag';
  public fullName: string = 'Hop\'s Bag SV9';
  public regulationMark = 'I';
  public cardImage: string = 'assets/cardback.png';
  public setNumber: string = '91';

  public text: string =
    'Search your deck for up to 2 Basic Hop’s Pokémon and put them onto your Bench. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      effect.preventDefault = true;
      player.hand.moveCardTo(effect.trainerCard, player.supporter);      
        
      // Allow player to search deck and choose up to 2 Basic Pokemon
      const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
    
      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      } else {
        // Check if bench has open slots
        const openSlots = player.bench.filter(b => b.cards.length === 0);
      
        if (openSlots.length === 0) {
          // No open slots, throw error
          throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
        }

        // We will discard this card after prompt confirmation
        effect.preventDefault = true;
           
        const maxCards = Math.min(2, openSlots.length);

        const blocked: number[] = [];
        player.deck.cards.forEach((card, index) => {
          if (card instanceof PokemonCard && !card.tags.includes(CardTag.HOPS)) {
            blocked.push(index);
          }
        });
          
        let cards: Card[] = [];
        return store.prompt(state, new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
          player.deck,
          { superType: SuperType.POKEMON, stage: Stage.BASIC, tags: [ CardTag.HOPS ] },
          { min: 0, max: maxCards, blocked, allowCancel: false }
        ), selectedCards => {
          cards = selectedCards || [];
        
          cards.forEach((card, index) => {
            player.deck.moveCardTo(card, slots[index]);
            slots[index].pokemonPlayedTurn = state.turn;
          });

          player.supporter.moveCardTo(this, player.discard);
        
          return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        });
      }
      
    }
    return state;
  }
}