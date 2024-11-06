import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, PowerType, GameMessage, StateUtils, GameError, Card, ChooseCardsPrompt } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';

// CEC Ultra Necrozma 164 (https://limitlesstcg.com/cards/CEC/164)
export class Ultra_Necrozma extends PokemonCard {

  public tags = [ CardTag.ULTRA_BEAST ]; // idk is this how you indicate that the pokemon is an ultra beast?

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 110;

  public weakness = [{ type: CardType.FAIRY }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Ultra Burst',
    useWhenInPlay: false,
    powerType: PowerType.ABILITY,
    text: 'This Pokémon can\'t attack unless your opponent has 2 or fewer Prize cards remaining.'
  }];

  public attacks = [
    { name: 'Luster of Downfall', cost: [CardType.PSYCHIC, CardType.METAL], damage: 170, text: 'Discard an Energy from your opponent\'s Active Pokémon.' }
  ];

  public set: string = 'SUM';

  public name: string = 'Ultra Necrozma';

  public fullName: string = 'Ultra Necrozma CEC';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // check to see if the opponent has less than 3 prize cards before allowing an attack
    // (Ultra Burst)
    if (effect instanceof AttackEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.getPrizeLeft() > 2){
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    // Luster of Downfall
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      let cards: Card[] = [];
      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        opponent.active,
        { superType: SuperType.ENERGY },
        { min: 1, max: 1, allowCancel: false },
      ), selected => {
        cards = selected || [];
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        return store.reduceEffect(state, discardEnergy);
      });

    }

    return state;
  }
  
}