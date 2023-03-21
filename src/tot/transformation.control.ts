import { ITOTAction } from './action/tot.action';
import { append, transformAction } from './transformation.function';
import { checkValidTotOperation } from './transformation.properties.conditions';

export function transformActionX(
  left: ITOTAction,
  right: ITOTAction,
  contextLeft: ITOTAction[],
  contextRight: ITOTAction[]
) {
  transformAction(contextLeft, left, right, 'left');
  transformAction(contextRight, right, left, 'right');
}

export function transformX(leftOperation: ITOTAction[], rightOperation: ITOTAction[]): ITOTAction[][] {
  checkValidTotOperation(leftOperation);
  checkValidTotOperation(rightOperation);

  const mutableRightOperation: ITOTAction[] = [];

  for (let i = 0; i < rightOperation.length; i++) {
    let rightAction: ITOTAction | null = rightOperation[i];
    
    const mutableLeftOperation: ITOTAction[] = [];

    for (let j = 0; j < leftOperation.length; j++) {
      const nextAction: ITOTAction[] = [];

      transformActionX(leftOperation[j], rightAction, mutableLeftOperation, nextAction);
      
      if(nextAction.length === 1) {
        rightAction = nextAction[0];
      } else if(nextAction.length === 0) {
        for (let k = 0; k < leftOperation.length; k++) {
          append(mutableLeftOperation, leftOperation[k]);
        }
        rightAction = null;
        break;
      } else {
        const pair = transformX(leftOperation.slice(j), nextAction);
        for (let k = 0; k < pair[0].length; k++) {
          append(mutableLeftOperation, pair[0][k]);
        }
        for (let k = 0; k < pair[1].length; k++) {
          append(mutableRightOperation, pair[1][k]);
        }
        rightAction = null;
        break;
      }
    }
    if (rightAction != null) {
      append(mutableRightOperation, rightAction);
    }
    leftOperation = mutableLeftOperation;
  }
  return [leftOperation, mutableRightOperation];
}

export function transform(operation: ITOTAction[], otherOperation: ITOTAction[], type: 'left' | 'right'): ITOTAction[]{
  if (!(type === 'left' || type === 'right'))
    throw new Error("type must be 'left' or 'right'");

  if(otherOperation.length === 0) {
    return operation;
  }

  if (operation.length === 1 && otherOperation.length === 1)
    return transformAction([], operation[0], otherOperation[0], type);

  if (type === 'left')
    return transformX(operation, otherOperation)[0];

  return transformX(otherOperation, operation)[1];
}