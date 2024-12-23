import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';

export class NsDarumaka extends PokemonCard {

  public tags = [ CardTag.N_POKEMON ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 80;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { name: 'Rolling Tackle', cost: [CardType.COLORLESS, CardType.COLORLESS], damage: 20, text: '' },
    { name: 'Flare', cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS], damage: 50, text: '' },
  ];

  public set: string = 'SVI';

  public name: string = 'N\'s Darumaka';

  public fullName: string = 'N\'s Darumaka SV9';

}
