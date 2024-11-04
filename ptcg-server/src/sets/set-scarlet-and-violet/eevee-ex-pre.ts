import { Card, CardList, CardTag, CardType, ChooseCardsPrompt, GameError, GameMessage, PokemonCard, PokemonCardList, PowerType, Stage, State, StateUtils, StoreLike, SuperType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { EvolveEffect, PowerEffect } from '../../game/store/effects/game-effects';

export class EeveeEXPRE extends PokemonCard {
  public tags = [ CardTag.POKEMON_EX_SV, CardTag.POKEMON_TERA ];
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.COLORLESS;
  public hp: number = 200;
  public weakness = [{ type: CardType.FIGHTING }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Eevee ex';
  public fullName = 'Eevee ex PRE';
  public powers = [{
    name: 'Rainbow DNA',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text: 'This Pokemon can evolve into any Pokemon ex that evolves from Eevee ' + 
      'if you play it from your hand onto this Pokemon. ' + 
      '(This Pokemon can\'t evolve during your first turn or the turn you play it.)'
  }];
  public attacks = [
    {
      name: 'Coruscating Quartz',
      cost: [ CardType.FIRE, CardType.WATER, CardType.LIGHTNING ],
      damage: 200,
      text: ''
    },
  ];
  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      
      const cardList: CardList = StateUtils.findCardList(state, this);
      if (cardList === undefined || !(cardList instanceof PokemonCardList)) { throw new GameError(GameMessage.CANNOT_USE_POWER); }
      if (cardList.pokemonPlayedTurn == state.turn) { throw new GameError(GameMessage.POKEMON_CANT_EVOLVE_THIS_TURN); }
      if (!player.hand.cards.some(p => {
        if (!(p instanceof PokemonCard)) { return false; }
        return ((p.evolvesFrom == 'Eevee') && (p.tags.includes(CardTag.POKEMON_EX_SV)));
      })) { throw new GameError(GameMessage.CANNOT_USE_POWER); }

      const evolveBlocked: number[] = [];
      player.hand.cards.forEach((p, index) => {
        if (p instanceof PokemonCard) {
          if (!((p.evolvesFrom == 'Eevee') && (p.tags.includes(CardTag.POKEMON_EX_SV)))) {
            evolveBlocked.push(index);
          }
        } 
      });

      let cards: Card[] = [];
      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
        player.hand,
        { superType: SuperType.POKEMON },
        { min:1, max: 1, allowCancel: true, blocked: evolveBlocked }
      ), selected => {
        cards = selected || [];
        if (cards.length > 0) {
          const pokemonCard = cards[0] as PokemonCard;
          const evolveEffect = new EvolveEffect(player, cardList, pokemonCard);
          store.reduceEffect(state, evolveEffect);
        }
      });
    }
    return state;
  }

}