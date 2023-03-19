import { clone, insert, isNotString } from 'util';
import { ITOTAction, TOTActionName } from './action';
import IStringDeleteAction from './action/string.delete.action';
import IStringInsertAction from './action/string.insert.action';
import {
  checkValidDeletedString,
  checkValidTotAction,
  checkValidTotOperation,
} from './transformation.properties.conditions';

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

export function normalize(operation: ITOTAction[] | ITOTAction): ITOTAction[] {
  return compose([], Array.isArray(operation) ? operation : [operation]);
}

export function transformPosition(
  position: number,
  action: ITOTAction,
  insertAfter?: boolean
): number {
  if (action.n === TOTActionName.StringInsert) {
    if (action.p < position || (action.p === position && insertAfter)) {
      return position + action.i.length;
    }
    return position;
  }

  if (position <= action.p) {
    return position;
  }
  if (position <= action.p + action.d.length) {
    return action.p;
  }
  return position - action.d.length;
}

export function transformCursor(
  position: number,
  action: ITOTAction,
  side: 'left' | 'right'
): number {
  const insertAfter = side === 'right';
  position = transformPosition(position, action, insertAfter);
  return position;
}

export function transformAction(
  context: ITOTAction[],
  action: ITOTAction,
  otherAction: ITOTAction,
  side: 'left' | 'right'
): ITOTAction[] {
  checkValidTotAction(action);
  checkValidTotAction(otherAction);

  if (action.n === TOTActionName.StringInsert) {
    _append(context, {
      n: TOTActionName.StringInsert,
      p: transformPosition(action.p, otherAction, side === 'right'),
      i: action.i,
    });
    return context;
  }

  if (otherAction.n === TOTActionName.StringInsert) {
    let remain = '';
    if (action.p < otherAction.p) {
      _append(context, {
        n: TOTActionName.StringDelete,
        p: action.p,
        d: action.d.slice(otherAction.p - action.p),
      });
      remain = action.d.slice(otherAction.p - action.p);
    }
    if (remain !== '') {
      _append(context, {
        n: TOTActionName.StringDelete,
        p: action.p + otherAction.i.length,
        d: remain,
      });
    }
    return context;
  }

  if (action.p >= otherAction.p + otherAction.d.length) {
    _append(context, {
      n: TOTActionName.StringDelete,
      p: action.p - otherAction.p,
      d: action.d,
    });
  } else if (action.p + action.d.length <= otherAction.p) {
    _append(context, action);
  } else {
    let deletedString = '';

    if (action.p < otherAction.p) {
      deletedString += action.d.slice(0, otherAction.p);
    }

    if (action.p + action.d.length > otherAction.p + otherAction.d.length) {
      deletedString += action.d.slice(
        otherAction.p + otherAction.d.length - action.p
      );
    }

    checkValidDeletedString(action, otherAction);

    if (deletedString !== '') {
      const position = transformPosition(action.p, otherAction);
      _append(context, {
        n: TOTActionName.StringDelete,
        p: position,
        d: deletedString,
      });
    }
  }

  return context;
}

export function invertAction(action: ITOTAction): ITOTAction {
  return action.n === TOTActionName.StringInsert
    ? { n: TOTActionName.StringDelete, p: action.p, d: action.i }
    : { n: TOTActionName.StringInsert, p: action.p, i: action.d };
}

export function invertOperation(operation: ITOTAction[]): ITOTAction[] {
  const mutableOperation = operation.slice().reverse();
  for (let i = 0; i < mutableOperation.length; i++) {
    mutableOperation[i] = invertAction(mutableOperation[i]);
  }
  return mutableOperation;
}
