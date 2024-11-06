import { PokemonCard } from '../../game/store/card/pokemon-card';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, GameError, ChooseCardsPrompt } from '../../game';
import { StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Slowking extends PokemonCard {

  public tags = [ ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Slowpoke';

  public cardType: CardType = CardType.WATER;

  public hp: number = 120;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    {
      name: 'Memory Melt',
      cost: [ CardType.WATER ],
      damage: 0,
      text: 'Look at your opponent\'s hand and put a card you find there in the Lost Zone.'
    },
  
    {
      name: 'Psychic',
      cost: [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ],
      damage: 60,
      text: 'This attack does 20 more damage times the amount of Energy attached to your opponent\'s Active Pokémon.'
    }
  ];

  public set: string = 'SUM';

  public name: string = 'Slowking';

  public fullName: string = 'Slowking LOT';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      
      if (player.hand.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        opponent.hand,
        { },
        { allowCancel: false, min: 1, max: 1 }
      ), cards => {
        cards = cards || [];
        opponent.hand.moveCardsTo(cards, opponent.lostzone);
      });
  
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentProvidedEnergy = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, opponentProvidedEnergy);
      const opponentEnergyCount = opponentProvidedEnergy.energyMap
        .reduce((left, p) => left + p.provides.length, 0);
    
      effect.damage += opponentEnergyCount * 20;
    }

    return state;
  }
}