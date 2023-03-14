import { IJOTAction } from './action';

export interface IJot {
  apply: (json: any, actions: IJOTAction[]) => void;

  transformX: (
    leftOp: IJOTAction[],
    rightOp: IJOTAction[]
  ) => [IJOTAction[], IJOTAction[]];

  transform: (
    op: IJOTAction[],
    otherOp: IJOTAction[],
    type: 'left' | 'right'
  ) => IJOTAction[];

  invert: (op: IJOTAction[]) => IJOTAction[];

  compose: (op: IJOTAction[], otherOp: IJOTAction[]) => IJOTAction[];
}
