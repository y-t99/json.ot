import { createOTTypeTransformFunction } from 'ot.type.factory';
import { ITOTAction } from './action/tot.action';
import { append, transformAction } from './transformation.function';

export const {
  transformX,
  transform
} = createOTTypeTransformFunction<ITOTAction>(transformAction, append);
