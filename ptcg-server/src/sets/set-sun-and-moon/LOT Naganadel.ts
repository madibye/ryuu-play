import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { Stage, CardType, SuperType, EnergyType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, GameError, EnergyCard } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { StateUtils } from '../../game/store/state-utils';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

// LOT Naganadel 108 (https://limitlesstcg.com/cards/LOT/108)
export class Naganadel extends PokemonCard {

  public tags = [ CardTag.ULTRA_BEAST ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Poipole';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 130;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [ CardType.COLORLESS ];

  public powers = [{
    name: 'Charging Up',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), you may attach a basic Energy card from your discard pile to this Pokémon. '
  }];

  public attacks = [
    { 
      name: 'Turning Point', 
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS], 
      damage: 80, 
      text: 'If you have exactly 3 Prize cards remaining, this attack does 80 more damage.' 
    },
  ];

  public set: string = 'LOT';

  public name: string = 'Naganadel';

  public fullName: string = 'Naganadel LOT';

  public readonly CHARGE_MARKER = 'CHARGE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.CHARGE_MARKER, this);
    }

    // Charging Up
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.CHARGE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }
      // checking if there's energy in the discard
      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
            && c.energyType === EnergyType.BASIC;
      });
      if (!hasEnergyInDiscard) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const cardList = StateUtils.findCardList(state, this);
      if (cardList === undefined) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_ATTACH,
        player.discard,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
        { min: 1, max: 1, allowCancel: false }
      ), cards => {
        cards = cards || [];
        if (cards.length > 0) {
          player.marker.addMarker(this.CHARGE_MARKER, this);
          player.discard.moveCardsTo(cards, cardList);
        }
      });
    }

    // Turning Point
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      if (player.getPrizeLeft() === 3){
        effect.damage += 80;
      }
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.CHARGE_MARKER, this);
    }
    return state;
  }
}