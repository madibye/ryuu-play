import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, StateUtils, GameError, GameMessage, PlayerType, ChooseCardsPrompt, ChoosePokemonPrompt, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import {PlayPokemonEffect} from '../../game/store/effects/play-card-effects';

export class VolcanionPS extends PokemonCard {

  public tags = [ CardTag.PRISM_STAR ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 160;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Jet Geyser',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), you may discard a [W] Energy card from your hand. If you do, your opponent switches their Active Pokémon with 1 of their Benched Pokémon.'
  }];

  public attacks = [
    {
      name: 'Sauna Blast',
      cost: [ CardType.WATER, CardType.WATER, CardType.WATER ],
      damage: 100,
      text: 'This attack does 20 damage to each of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'
    }
  ];

  public set: string = 'SSH';

  public name: string = 'Volcanion Prism Star';

  public fullName: string = 'Volcanion Prism Star FLI';

  public readonly JET_GEYSER_MARKER = 'JET_GEYSER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.JET_GEYSER_MARKER, this);
    }

    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (player.hand.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.JET_GEYSER_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }
      
      state = store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        { superType: SuperType.ENERGY, name: 'Water Energy' },
        { allowCancel: false, min: 1, max: 1 }
      ), cards => {
        cards = cards || [];
        player.marker.addMarker(this.JET_GEYSER_MARKER, this);
        player.hand.moveCardsTo(cards, player.discard);

        return store.prompt(state, new ChoosePokemonPrompt(
          opponent.id,
          GameMessage.CHOOSE_POKEMON_TO_SWITCH,
          PlayerType.BOTTOM_PLAYER,
          [ SlotType.BENCH ],
          { allowCancel: false }
        ), result => {
          const cardList = result[0];
          opponent.switchPokemon(cardList);
        });
      });
  
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card) => {
        if (cardList !== opponent.active){
          const damageEffect = new PutDamageEffect(effect, 20);
          damageEffect.target = cardList;
          store.reduceEffect(state, damageEffect);
        }
      });
    }

    if (effect instanceof EndTurnEffect){
      effect.player.marker.removeMarker(this.JET_GEYSER_MARKER, this);
    }

    return state;
  }

}