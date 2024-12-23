import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';

export class NsZorua extends PokemonCard {

  public tags = [ CardTag.N_POKEMON ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARK;

  public hp: number = 70;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Scratch', cost: [CardType.DARK], damage: 20, text: '' }
  ];

  public set: string = 'SVI';

  public name: string = 'N\'s Zorua';

  public fullName: string = 'N\'s Zorua SV9';

}
