import { createOTTypeTransformFunction } from 'ot.type.factory';
import { IJOTAction } from './action';
import { append, transformAction } from './transformation.function';

export const { transformX, transform } = createOTTypeTransformFunction<IJOTAction>(transformAction, append);
