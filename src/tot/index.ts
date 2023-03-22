import { ITOTAction } from './action/tot.action';
import { IOTType } from 'ot.interface';
import { transform, transformX } from './transformation.control';
import { apply, compose, invert } from './transformation.function';

export const tot: IOTType<ITOTAction, string> = {
  name: 'tot',

  transformX,

  transform,

  apply,

  compose,

  invert,
};
