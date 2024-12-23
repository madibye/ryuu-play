import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, GameError, ChooseCardsPrompt, ChooseAttackPrompt, StateUtils, Attack, GameLog } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import {DealDamageEffect} from '../../game/store/effects/attack-effects';

function* useNightJoker(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const benched = player.bench.filter(b => b.cards.length > 0 && b.getPokemonCard()?.tags.includes(CardTag.N_POKEMON) && player.active !== b);

  const allYourPokemon = [...benched.map(b => b.getPokemonCard())];

  let selected: any;
  yield store.prompt(state, new ChooseAttackPrompt(
    player.id,
    GameMessage.CHOOSE_ATTACK_TO_COPY,
    allYourPokemon.filter((card): card is any => card !== undefined),
    { allowCancel: false }
  ), result => {
    selected = result;
    next();
  });

  const attack: Attack | null = selected;
  if (attack === null) {
    return state;
  }

  store.log(state, GameLog.LOG_PLAYER_COPIES_ATTACK, {
    name: player.name,
    attack: attack.name
  });

  // Perform attack
  const attackEffect = new AttackEffect(player, opponent, attack);
  store.reduceEffect(state, attackEffect);
  
  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }
  
  if (attackEffect.damage > 0) {
    const dealDamage = new DealDamageEffect(attackEffect, attackEffect.damage);
    state = store.reduceEffect(state, dealDamage);
  }
  
  return state;
}

export class NsZoroarkex extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex, CardTag.N_POKEMON ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'N\'s Zorua';

  public cardType: CardType = CardType.DARK;

  public hp: number = 280;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public powers = [{
    name: 'Trade',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'You must discard a card from your hand in order to use this Ability. Once during your turn, you may draw 2 cards.'
  }];

  public attacks = [
    {
      name: 'Night Joker',
      cost: [ CardType.DARK, CardType.DARK ],
      damage: 0,
      text: 'Choose 1 of your Benched N’s Pokémon’s attacks and use it as this attack.'
    }
  ];

  public set: string = 'SVI';

  public name: string = 'N\'s Zoroark ex';

  public fullName: string = 'N\'s Zoroark ex SV9';

  public readonly TRADE_MAREKER = 'TRADE_MAREKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      player.marker.removeMarker(this.TRADE_MAREKER, this);
    }

    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      if (player.hand.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }
      if (player.marker.hasMarker(this.TRADE_MAREKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }
      state = store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        { },
        { allowCancel: false, min: 1, max: 1 }
      ), cards => {
        cards = cards || [];
        player.marker.addMarker(this.TRADE_MAREKER, this);
        player.hand.moveCardsTo(cards, player.discard);
        player.deck.moveTo(player.hand, 2);
      });
  
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const generator = useNightJoker(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}