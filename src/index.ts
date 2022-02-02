import { Logger } from 'tslog';
import { myContainer } from './inversify-example/inversify.config';
import { TYPES } from './inversify-example/types';
import { Warrior } from './inversify-example/interfaces';

const ninja = myContainer.get<Warrior>(TYPES.Warrior);
const log: Logger = new Logger();

log.info(ninja.fight());
log.info(ninja.sneak());
