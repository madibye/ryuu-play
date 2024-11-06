import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, PlayerType, SlotType, GameError, ChoosePokemonPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect, AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class DecidueyeGX extends PokemonCard {

  public tags = [ CardTag.POKEMON_GX ];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Dartrix';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 240;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Feather Arrow',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), you may put 2 damage counters on 1 of your opponent\'s Pokémon.'
  }];

  public attacks = [
    {
      name: 'Razor Leaf',
      cost: [ CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS ],
      damage: 90,
      text: ''
    },
  
    {
      name: 'Hollow Hunt-GX',
      cost: [ CardType.GRASS ],
      damage: 0,
      text: 'Put 3 cards from your discard pile into your hand. (You can\'t use more than 1 GX attack in a game.)'
    }
  ];

  public set: string = 'SUM';

  public name: string = 'Decidueye-GX';

  public fullName: string = 'Decidueye-GX SUM';

  public readonly FEATHER_ARROW_MARKER = 'FEATHER_ARROW_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.FEATHER_ARROW_MARKER, this);
    }
    
    // Feather Arrow
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      // Check marker
      if (player.marker.hasMarker(this.FEATHER_ARROW_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }
  
      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [ SlotType.ACTIVE, SlotType.BENCH ],
        { allowCancel: true }
      ), targets => {
        player.marker.addMarker(this.FEATHER_ARROW_MARKER, this);
        if (!targets || targets.length === 0) {
          return;
        }
        const target = targets[0];
        target.damage += 20;
        return state;
      });
    }

    // Hollow Hunt-GX
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      // Check if player has used GX attack
      if (player.usedGX == true) {
        throw new GameError(GameMessage.LABEL_GX_USED);
      }
      // set GX attack as used for game
      player.usedGX = true;
        
      if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
        const player = effect.player;
      
        if (player.discard.cards.length === 0) {
          return state;
        }
      
        return store.prompt(state, [
          new ChooseCardsPrompt(
            player.id,
            GameMessage.CHOOSE_CARD_TO_HAND,
            player.discard,
            {  },
            { min: 1, max: 3, allowCancel: false }
          )], selected => {
          const cards = selected || [];
          player.discard.moveCardsTo(cards, player.hand);
        });
      }
      
      return state;
        
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.FEATHER_ARROW_MARKER, this);
    }
    return state;
  }
}