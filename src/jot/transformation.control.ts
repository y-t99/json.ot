import { IJOTAction } from './action';

export function transformX(
  leftOp: IJOTAction[],
  rightOp: IJOTAction[]
): [IJOTAction[], IJOTAction[]] {
  return [[], []];
}

export function transform(
  op: IJOTAction[],
  otherOp: IJOTAction[],
  type: 'left' | 'right'
): IJOTAction[] {
  return [];
}
