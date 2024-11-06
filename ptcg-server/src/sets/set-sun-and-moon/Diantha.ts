import { Card } from '../../game/store/card/card';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { Effect } from '../../game/store/effects/effect';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { CardType } from '../../game/store/card/card-types';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { GamePhase, State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { KnockOutEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

function* playCard(next: Function, store: StoreLike, state: State,
  self: Diantha, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  // No Pokemon KO last turn
  if (!player.marker.hasMarker(self.DIANTHA_MARKER)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }
    
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DECK,
    player.discard,
    { },
    { min: 0, max: 2, allowCancel: false }
  ), selected => {
    cards = selected || [];
    player.discard.moveCardsTo(cards, player.hand);
    
  });
}

export class Diantha extends TrainerCard {

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'SUM';

  public name: string = 'Diantha';

  public fullName: string = 'Diantha FLI';

  public text: string =
    'You can play this card only if 1 of your [Y] Pokémon was Knocked Out during your opponent\'s last turn. \n\nPut 2 cards from your discard pile into your hand. ';

  public readonly DIANTHA_MARKER = 'DIANTHA_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof KnockOutEffect && effect.target.getPokemonCard()?.cardType === CardType.FAIRY) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      // Do not activate between turns, or when it's not opponents turn.
      if (!duringTurn || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === player) {
        effect.player.marker.addMarker(this.DIANTHA_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.DIANTHA_MARKER);
    }

    return state;
  }

}
