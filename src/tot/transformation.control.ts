import { ITOTAction } from './action/tot.action';
import { append, transformAction } from './transformation.function';
import { checkValidTotOperation } from './transformation.properties.conditions';

/**
 * left: insert & right: insert: contextLeft and contextRight both add one insert action.
 * 
 * left: insert & right: delete: contextLeft add one insert action; contextRight maybe add one delete action or two delete actions.
 * 
 * left: delete & right: insert: contextLeft add one delete action or two delete actions; contextRight add one insert action;
 * 
 * left: delete & right: delete: contextLeft and contextRight both maybe add one delete action or zero action.
 * 
 * @param left          
 * @param right         
 * @param contextLeft   
 * @param contextRight  
 */
export function transformActionX(
  left: ITOTAction,
  right: ITOTAction,
  contextLeft: ITOTAction[],
  contextRight: ITOTAction[]
) {
  transformAction(contextLeft, left, right, 'left');
  transformAction(contextRight, right, left, 'right');
}

/**
 * transform left operation and right operation, let them under same context.
 * @param leftOperation       the left operation under version 1 context
 * @param rightOperation     the right operation under version 2 context
 * @returns the left operation and the right operation both version 3 context
 */
export function transformX(leftOperation: ITOTAction[], rightOperation: ITOTAction[]): [ITOTAction[], ITOTAction[]] {
  checkValidTotOperation(leftOperation);
  checkValidTotOperation(rightOperation);

  const mutableRightOperation: ITOTAction[] = [];

  for (const action of rightOperation) {
    let rightAction: ITOTAction | null = action;
    
    const mutableLeftOperation: ITOTAction[] = [];

    let i = 0;

    while(i < leftOperation.length) {
      const nextAction: ITOTAction[] = [];

      transformActionX(leftOperation[i], rightAction, mutableLeftOperation, nextAction);
      i++;

      if(nextAction.length === 1) {
        rightAction = nextAction[0];
      } else if(nextAction.length === 0) {
        for (let j = i; j < leftOperation.length; j++) {
          append(mutableLeftOperation, leftOperation[j]);
        }
        rightAction = null;
        break;
      } else {
        const pair = transformX(leftOperation.slice(i), nextAction);
        for (const transformLeftAction of pair[0]) {
          append(mutableLeftOperation, transformLeftAction);
        }
        for (const transformRightAction of pair[1]) {
          append(mutableRightOperation, transformRightAction);
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

/**
 * transform operation by the apply operation
 * @param operation               will be transform operation
 * @param otherOperation     the apply operation
 * @param type                       left and right the operation modify content position relative to other operation
 * @returns the transformed operation
 */
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