import { IOTType } from 'ot.interface';
import { IJOTAction } from './action';
import { transform, transformX } from './transformation.control';
import { apply, compose, IJson, invert } from './transformation.function';

export const jot: IOTType<IJOTAction, IJson> = {
  name: 'jot',

  transformX,

  transform,

  apply,

  compose,

  invert,
};
