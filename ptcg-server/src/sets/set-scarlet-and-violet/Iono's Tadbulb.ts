import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';

export class IonosTadbulb extends PokemonCard {

  public tags = [ CardTag.IONOS_POKEMON ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [{ name: 'Tiny Charge', cost: [CardType.LIGHTNING, CardType.COLORLESS], damage: 30, text: '' }];

  public set: string = 'SVI';

  public name: string = 'Iono\'s Tadbulb';

  public fullName: string = 'Iono\'s Tadbulb SV9';
  
}
