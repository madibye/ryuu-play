import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../game/store/card/card-types';
import { Card, ChooseCardsPrompt, ShuffleDeckPrompt } from '../../game';
import { StoreLike, State, GameMessage } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Gimmighoul extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    {
      name: 'Minor Errand-Running',
      cost: [ CardType.COLORLESS ],
      damage: 0,
      text: 'Search your deck for up to 2 Basic Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.'
    },

    {
      name: 'Tackle',
      cost: [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ],
      damage: 50,
      text: ''
    }
  ];
  public set: string = 'SVI';

  public name: string = 'Gimmighoul';

  public fullName: string = 'Gimmighoul SSP';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Minor Errand-Running
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        return state;
      }
        
      let cards: Card[] = [];
      store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
        { min: 0, max: 2, allowCancel: false }
      ), selected => {
        cards = selected || [];
        player.deck.moveCardsTo(cards, player.hand);
      });
    
      return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    return state;
  }
} 
