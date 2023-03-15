import { clone, insert, isNotString } from 'util';
import { ITOTAction, TOTActionName } from './action';
import IStringDeleteAction from './action/string.delete.action';
import IStringInsertAction from './action/string.insert.action';
import { checkValidTotOperation } from './transformation.properties.conditions';

export function apply(snapshot: string, operation: ITOTAction[]): string {
  if (isNotString(snapshot))
    throw new Error(
      'text.ot operations cannot be applied to type: ' + typeof snapshot
    );

  checkValidTotOperation(operation);

  for (let i = 0; i < operation.length; i++) {
    const action = operation[i];
    if (action.n === TOTActionName.StringInsert) {
      snapshot = insert(snapshot, action.p, action.i);
    } else {
      const deleted = snapshot.slice(action.p, action.p + action.d.length);
      if (action.d !== deleted)
        throw new Error(
          "Delete component '" +
            action.d +
            "' does not match deleted text '" +
            deleted +
            "'"
        );

      snapshot =
        snapshot.slice(0, action.p) +
        snapshot.slice(action.p + action.d.length);
    }
  }

  return snapshot;
}

function _append(operation: ITOTAction[], action: ITOTAction): void {
  if (
    (action as IStringInsertAction).i === '' ||
    (action as IStringDeleteAction).d === ''
  )
    return;

  const mutableAction = clone(action);

  if (operation.length === 0) {
    operation.push(mutableAction);
  } else {
    const last = operation[operation.length - 1];
    if (
      last.n === TOTActionName.StringInsert &&
      mutableAction.n === TOTActionName.StringInsert &&
      last.p <= mutableAction.p &&
      last.p + last.i.length > mutableAction.p
    ) {
      operation[operation.length - 1] = {
        n: TOTActionName.StringInsert,
        p: last.p,
        i: insert(last.i, mutableAction.p - last.p, mutableAction.i),
      };
    } else if (
      last.n === TOTActionName.StringDelete &&
      mutableAction.n === TOTActionName.StringDelete &&
      last.p > mutableAction.p &&
      last.p <= mutableAction.p + mutableAction.d.length
    ) {
      operation[operation.length - 1] = {
        n: TOTActionName.StringDelete,
        p: mutableAction.p,
        d: insert(mutableAction.d, last.p - mutableAction.p, last.d),
      };
    } else {
      operation.push(mutableAction);
    }
  }
}

export function compose(operationA: ITOTAction[], operationB: ITOTAction[]) {
  checkValidTotOperation(operationA);
  checkValidTotOperation(operationB);

  const mutableOperation = clone(operationA);

  for (let i = 0; i < operationB.length; i++) {
    _append(mutableOperation, operationB[i]);
  }

  return mutableOperation;
}

export function invertAction(action: ITOTAction): ITOTAction {
  return action.n === TOTActionName.StringInsert
    ? { n: TOTActionName.StringDelete, p: action.p, d: action.i }
    : { n: TOTActionName.StringInsert, p: action.p, i: action.d };
}
