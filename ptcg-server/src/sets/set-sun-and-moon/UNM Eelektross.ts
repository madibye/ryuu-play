import { Card, CardTarget, CardType, EnergyCard, GameError, GameLog, GameMessage, MoveEnergyPrompt, PlayerType, PokemonCard, PokemonCardList, PowerType, Resistance, SlotType, Stage, State, StateUtils, StoreLike, SuperType } from '../../game';
import { CheckProvidedEnergyEffect, CheckRetreatCostEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';

export class EelektrossUNM extends PokemonCard {

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Eelektrik';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 150;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.METAL, value: -20 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS,];

  public set = 'SUM';

  public name = 'Eelektross';

  public fullName = 'Eelektross UNM';

  public powers = [
    {
      name: 'Electric Swamp',
      powerType: PowerType.ABILITY,
      text: 'Once during your turn (before your attack), if this Pokemon is in your hand and you have at ' +
        'least 4 L Energy cards in play, you may play this Pokemon onto your Bench. If you do, move any number of ' +
        'L Energy from your other Pokemon to this Pokemon.'
    }
  ];

  public attacks = [
    {
      name: 'Hover Over',
      cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 130,
      text: 'The Defending Pokemon can\'t retreat during your opponent\'s next turn',
    }
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Elusive Master
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this && effect.target.cards.length === 0) {
      const player = effect.player;

      // Can't bench this Pokemon unless we have 4 Lightning Energy cards in play.
      const energyCards: Card[] = [];
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.cards.filter(c => (
          (c instanceof EnergyCard) && (!energyCards.includes(c)) &&
          (c.provides.includes(CardType.LIGHTNING) || c.provides.includes(CardType.ANY)))
        ).forEach(c => energyCards.push(c));
      });
      if (energyCards.length < 4) { return state; }

      // Bench this Pokemon to the desired slot.
      effect.preventDefault = true;  // this might prevent errors from trying to bench a stage 2 idk
      store.log(state, GameLog.LOG_PLAYER_PLAYS_BASIC_POKEMON, { name: player.name, card: this.name });
      player.hand.moveCardTo(this, effect.target);
      effect.target.pokemonPlayedTurn = state.turn;

      // Then, prompt player to move Lightning energy from their other Pokemon to this one.
      const blockedFrom: CardTarget[] = [];
      const blockedTo: CardTarget[] = [];
      const blockedMap: { source: CardTarget, blocked: number[] }[] = [];

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        // We can only move from other Pokemon to this one.
        if (card === this) { blockedFrom.push(target); }
        else { blockedTo.push(target); }

        const blocked: number[] = [];
        const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, cardList);
        store.reduceEffect(state, checkProvidedEnergy);
        checkProvidedEnergy.energyMap.forEach(em => {
          if (!em.provides.includes(CardType.LIGHTNING) && !em.provides.includes(CardType.ANY)) {
            const index = cardList.cards.indexOf(em.card);
            if (index !== -1 && !blocked.includes(index)) { blocked.push(index); }
          }
        });
        if (blocked.length !== 0) { blockedMap.push({ source: target, blocked }); }
      });

      return store.prompt(state, new MoveEnergyPrompt(
        player.id,
        GameMessage.MOVE_ENERGY_CARDS,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { superType: SuperType.ENERGY },
        { allowCancel: true, blockedFrom, blockedTo, blockedMap }
      ), transfers => {
        if (transfers === null) { return; }
        for (const transfer of transfers) {
          const source = StateUtils.getTarget(state, player, transfer.from);
          const target = StateUtils.getTarget(state, player, transfer.to);
          source.moveCardTo(transfer.card, target);
        }
      });
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      opponent.active.marker.addMarker(PokemonCardList.DEFENDING_POKEMON_CANNOT_RETREAT_MARKER, this);
    }

    if (effect instanceof CheckRetreatCostEffect &&
      effect.player.active.marker.hasMarker(PokemonCardList.DEFENDING_POKEMON_CANNOT_RETREAT_MARKER, this)
    ) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.active.marker.removeMarker(PokemonCardList.DEFENDING_POKEMON_CANNOT_RETREAT_MARKER, this);
    }

    return state;
  }
}