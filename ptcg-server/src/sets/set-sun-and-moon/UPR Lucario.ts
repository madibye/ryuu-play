import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, PlayerType, GameError, Card } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect, AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class LucarioUPR extends PokemonCard {

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Riolu';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 110;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [ CardType.COLORLESS ];

  public powers = [{
    name: 'Precognitive Aura',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), if you have Garchomp in play, you may search your deck for a card and put it into your hand. Then, shuffle your deck.'
  }];

  public attacks = [
    {
      name: 'Missile Jab',
      cost: [ CardType.FIGHTING, CardType.COLORLESS ],
      damage: 70,
      text: 'This attack\'s damage isn\'t affected by Resistance. '
    }
  ];

  public set: string = 'SUM';

  public name: string = 'Lucario';

  public fullName: string = 'Lucario UPR';

  public readonly PRECOGNITIVE_MARKER = 'PRECOGNITIVE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.PRECOGNITIVE_MARKER, this);
    }
    
    // Precognitive Aura
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0){
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }
      
      if (player.marker.hasMarker(this.PRECOGNITIVE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      // checking for a garchomp
      let isGarchompThere = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        if (cardList.getPokemonCard()?.name.includes('Garchomp')) {
          isGarchompThere = true;
        }
      });
      if (!isGarchompThere){
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      let cards: Card[] = [];
      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        {},
        { min: 1, max: 1, allowCancel: false }
      ), selected => {
        cards = selected || [];
        player.marker.addMarker(this.PRECOGNITIVE_MARKER, this);
        player.deck.moveCardsTo(cards, player.hand);
      });
    }

    // Missile Jab
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      effect.ignoreResistance = true;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.PRECOGNITIVE_MARKER, this);
    }
    return state;
  }
}