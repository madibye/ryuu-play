import { CardType, ChooseCardsPrompt, GameMessage, PokemonCard, PokemonCardList, Stage, State, StoreLike, SuperType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';


export class EeveeSCR extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.COLORLESS;
  public hp: number = 60;
  public weakness = [{ type: CardType.FIGHTING }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Eevee';
  public fullName = 'Eevee SCR';
  public attacks = [
    {
      name: 'Call for Family',
      cost: [ CardType.COLORLESS ],
      damage: 0,
      text: 'Search your deck for a Basic Pokemon and put it onto your Bench. Then, shuffle your deck.'
    },
    {
      name: 'Gnaw',
      cost: [ CardType.COLORLESS, CardType.COLORLESS ],
      damage: 20,
      text: '',
    },
  ];
  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
    
      // Player has no empty bench slot
      if (slots.length === 0) {
        return state;
      }
    
      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
        player.deck,
        { superType: SuperType.POKEMON, stage: Stage.BASIC },
        { min: 1, max: 1, allowCancel: true }
      ), selected => {
        if (selected && selected.length > 0) {
          // Move selected card from deck to bench
          player.deck.moveCardsTo(selected, slots[0]);
        }
      });
    }

    return state;
  }
}