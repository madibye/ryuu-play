

export enum GameMessage {
  ASLEEP_FLIP = 'ASLEEP_FLIP',
  CONFUSION_FLIP = 'CONFUSION_FLIP',
  BOT_NOT_INITIALIZED = 'BOT_NOT_INITIALIZED',
  BOT_NOT_FOUND = 'BOT_NOT_FOUND',
  BURNED_DAMAGE_FLIP = 'BURNED_DAMAGE_FLIP',
  CLIENT_NOT_CONNECTED = 'CLIENT_NOT_CONNECTED',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  ACTION_IN_PROGRESS = 'ACTION_IN_PROGRESS',
  ILLEGAL_ACTION = 'ILLEGAL_ACTION',
  INVALID_DECK = 'INVALID_DECK',
  GAME_INVITATION_MESSAGE = 'GAME_INVITATION_MESSAGE',
  ALREADY_PLAYING = 'ALREADY_PLAYING',
  MAX_PLAYERS_REACHED = 'MAX_PLAYERS_REACHED',
  SETUP_PLAYER_NO_BASIC = 'SETUP_NO_BASIC',
  SETUP_OPPONENT_NO_BASIC = 'SETUP_OPPONENT_NO_BASIC',
  SETUP_WHO_BEGINS_FLIP = 'SETUP_WHO_BEGINS_FLIP',
  CHOOSE_STARTING_POKEMONS = 'CHOOSE_STARTING_POKEMONS',
  UNKNOWN_CARD = 'UNKNOWN_CARD',
  UNKNOWN_POWER = 'UNKNOWN_POWER',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  PROMPT_ALREADY_RESOLVED = 'PROMPT_ALREADY_RESOLVED',
  INVALID_TARGET = 'INVALID_TARGET',
  UNKNOWN_ATTACK = 'UNKNOWN_ATTACK',
  ENERGY_ALREADY_ATTACHED = 'ENERGY_ALREADY_ATTACHED',
  SUPPORTER_ALREADY_PLAYED = 'SUPPORTER_ALREADY_PLAYED',
  STADIUM_ALREADY_PLAYED = 'STADIUM_ALREADY_PLAYED',
  SAME_STADIUM_ALREADY_IN_PLAY = 'SAME_STADIUM_ALREADY_IN_PLAY',
  STADIUM_ALREADY_USED = 'STADIUM_ALREADY_USED',
  NO_STADIUM_IN_PLAY = 'NO_STADIUM_IN_PLAY',
  POKEMON_TOOL_ALREADY_ATTACHED = 'POKEMON_TOOL_ALREADY_ATTACHED',
  NOT_ENOUGH_ENERGY = 'NOT_ENOUGH_ENERGY',
  RETREAT_MESSAGE = 'RETREAT_MESSAGE',
  CHOOSE_NEW_ACTIVE_POKEMON = 'CHOOSE_NEW_ACTIVE_POKEMON',
  CHOOSE_PRIZE_CARD = 'CHOOSE_PRIZE_CARD',
  INVALID_GAME_STATE = 'INVALID_GAME_STATE',
  RETREAT_ALREADY_USED = 'RETREAT_ALREADY_USED',
  CANNOT_PLAY_THIS_CARD = 'CANNOT_PLAY_THIS_CARD',
  CANNOT_USE_POWER = 'CANNOT_USE_POWER',
  INVALID_PROMPT_RESULT = 'INVALID_PROMPT_RESULT',
  BLOCKED_BY_SPECIAL_CONDITION = 'BLOCKED_BY_SPECIAL_CONDITION',
  POWER_ALREADY_USED = 'POWER_ALREADY_USED',
  POKEMON_CANT_EVOLVE_THIS_TURN = 'POKEMON_CANT_EVOLVE_THIS_TURN',

  LOG_SHUFFLE_DECK = '{1} shuffles the deck.',
  LOG_DRAW_CARDS = '{1} draws {2} cards.'
}

export class GameError extends Error {

  constructor(message: GameMessage, public param?: string) {
    super(message);
  }

}
