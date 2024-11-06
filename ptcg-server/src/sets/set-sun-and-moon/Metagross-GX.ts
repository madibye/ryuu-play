import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, PlayerType, SlotType, GameError, AttachEnergyPrompt, EnergyCard, Card } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { StateUtils } from '../../game/store/state-utils';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { PowerEffect, AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { ShuffleDeckPrompt } from '../../game/store/prompts/shuffle-prompt';

function* useAlgorithmGX(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  
  if (player.deck.cards.length === 0) {
    return state;
  }
  
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });
  
  player.deck.moveCardsTo(cards, player.hand);
  
  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class MetagrossGX extends PokemonCard {

  public tags = [ CardTag.POKEMON_GX ];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Metang';

  public cardType: CardType = CardType.METAL;

  public hp: number = 250;

  public weakness = [{ type: CardType.FIRE }];  

  public resistance = [{ type: CardType.PSYCHIC, value: -20 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Geotech System',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), you may attach a [P] or [M] Energy card from your discard pile to your Active Pokémon.'
  }];

  public attacks = [
    {
      name: 'Giga Hammer',
      cost: [ CardType.METAL, CardType.METAL, CardType.COLORLESS ],
      damage: 150,
      text: 'This Pokémon can\'t use Giga Hammer during your next turn.'
    },
  
    {
      name: 'Algorithm-GX',
      cost: [ CardType.COLORLESS ],
      damage: 0,
      text: 'Search your deck for up to 5 cards and put them into your hand. Then, shuffle your deck. (You can\'t use more than 1 GX attack in a game.)'
    }
  ];

  public set: string = 'SUM';

  public name: string = 'Metagross-GX';

  public fullName: string = 'Metagross-GX GRI';

  public readonly GEOTECH_MARKER = 'GEOTECH_MARKER';

  public readonly HAMMER_MARKER_1 = 'HAMMER_MARKER_1';
  public readonly HAMMER_MARKER_2 = 'HAMMER_MARKER_2';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.GEOTECH_MARKER, this);
    }
    
    // Geotech System
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
            && c.energyType === EnergyType.BASIC
            && (c.provides.includes(CardType.PSYCHIC) || c.provides.includes(CardType.METAL));
      });
      if (!hasEnergyInDiscard) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }
      if (player.marker.hasMarker(this.GEOTECH_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_TO_ACTIVE,
        player.hand,
        PlayerType.BOTTOM_PLAYER,
        [ SlotType.ACTIVE ],
        { superType: SuperType.ENERGY, name: 'Psychic Energy' },
        { allowCancel: false, min: 1, max: 1 }
      ), transfers => {
        transfers = transfers || [];
        player.marker.addMarker(this.GEOTECH_MARKER, this);
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.hand.moveCardTo(transfer.card, target);
        }
      });
    }

    // Giga Hammer
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      // Check marker
      if (effect.player.marker.hasMarker(this.HAMMER_MARKER_1, this)) {
        console.log('attack blocked');
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
      effect.player.marker.addMarker(this.HAMMER_MARKER_1, this);
      console.log('marker added');
    }

    // Algorithm-GX
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      // Check if player has used GX attack
      if (player.usedGX == true) {
        throw new GameError(GameMessage.LABEL_GX_USED);
      }
      // set GX attack as used for game
      player.usedGX = true;

      if (player.deck.cards.length === 0) {
        return state;
      }

      const generator = useAlgorithmGX(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      const player = effect.player;
      player.marker.removeMarker(this.GEOTECH_MARKER, this);

      // removing the markers for preventing the pokemon from attacking
      if (player.marker.hasMarker(this.HAMMER_MARKER_2, this)) {
        player.marker.removeMarker(this.HAMMER_MARKER_1, this);
        player.marker.removeMarker(this.HAMMER_MARKER_2, this);
        console.log('marker cleared');
      }

      if (player.marker.hasMarker(this.HAMMER_MARKER_1, this)) {
        player.marker.addMarker(this.HAMMER_MARKER_2, this);
        console.log('second marker added');
      }
    }
    return state;
  }
}