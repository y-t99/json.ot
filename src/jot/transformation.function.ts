import { JOTActionName } from './action/jot.action.name.enum';
import { ITextDeleteAction } from './action/text.delete.action';
import { ITextInsertAction } from './action/text.insert.action';
import { IOTType } from 'ot.interface';
/**
 * Transformation functions are responsible for performing actual transformations on the target operation
 * according to the impact of the reference operation.
 * Transformation functions are dependent on the types and parameters of operations, and data and operation model of the OT system.
 * Transformation functions produce output operations for control algorithms.
 */
import { IJOTAction, IJOTPath, ISubTypeAction } from './action';
import { clone } from 'utils';
import { TOTActionName } from 'tot/action';

const subtypes: { [_: string]: IOTType<any, any> } = {};
export function registerSubtype(subtype: IOTType<any, any>) {
  subtypes[subtype.name] = subtype;
}

export function invertAction(action: IJOTAction): IJOTAction {
  const reversalAction: { [key: string]: any } = { p: action.p };

  if (action.n === JOTActionName.SubType && subtypes[action.t]) {
    reversalAction.t = action.t;
    reversalAction.o = subtypes[action.t].invert(action.o);
  }

  if ('si' in action) reversalAction.sd = action.si;
  if ('sd' in action) reversalAction.si = action.sd;
  if ('oi' in action) reversalAction.od = action.oi;
  if ('od' in action) reversalAction.oi = action.od;
  if ('li' in action) reversalAction.ld = action.li;
  if ('ld' in action) reversalAction.li = action.ld;
  if ('na' in action) reversalAction.na = -action.na;

  if ('lm' in action) {
    reversalAction.lm = action.p[action.p.length - 1];
    reversalAction.p = action.p.slice(0, action.p.length - 1).concat([action.lm]);
  }

  return reversalAction as IJOTAction;
}

export function invert(operation: IJOTAction[]): IJOTAction[] {
  const reversedOperation = operation.slice().reverse();
  const invertedOperation = [];
  for (const action of reversedOperation) {
    invertedOperation.push(invertAction(action));
  }
  return invertedOperation;
}

function convertFromText(action: ITextInsertAction | ITextDeleteAction): ISubTypeAction {
  const path = action.p.slice(0, action.p.length - 1);
  const position = action.p[action.p.length - 1];
  if (action.n === JOTActionName.TextInsert) {
    return {
      n: JOTActionName.SubType,
      t: 'tot',
      p: path,
      o: [
        {
          n: TOTActionName.StringInsert,
          p: position,
          i: action.si,
        },
      ],
    };
  }
  return {
    n: JOTActionName.SubType,
    t: 'tot',
    p: path,
    o: [
      {
        n: TOTActionName.StringDelete,
        p: position,
        i: action.sd,
      },
    ],
  };
}

function convertToText(action: ISubTypeAction): ITextInsertAction | ITextDeleteAction {
  const path = action.p.slice();
  path.push(action.o.p);
  if (action.o.n === TOTActionName.StringInsert) {
    return {
      n: JOTActionName.TextInsert,
      p: path,
      si: action.o[0].i,
    };
  }
  return {
    n: JOTActionName.TextDelete,
    p: path,
    sd: action.o[0].i,
  };
}

interface IJson {
  [_: string | number]: JsonValue;
}

type JsonValue = string | number | IJson | any[];

export function apply(snapshot: IJson | any[], operation: IJOTAction[]): IJson | any[] {
  const mutableSnapshot = clone(snapshot);
  const mutableOperation = clone(operation);

  const container = {
    data: mutableSnapshot,
  };

  for (let i = 0; i < mutableOperation.length; i++) {
    let action = mutableOperation[i];

    if (action.n === JOTActionName.TextInsert || action.n === JOTActionName.TextDelete) {
      action = convertFromText(action);
    }

    let currentLevel: JsonValue = container;
    let nextLevelKey: string | number = 'data';

    for (const position of action.p) {
      currentLevel = (currentLevel as IJson)[nextLevelKey];
      nextLevelKey = position;
    }
    // sub type
    if (action.n === JOTActionName.SubType && subtypes[action.t]) {
      (currentLevel as IJson)[nextLevelKey] = subtypes[action.t].apply((currentLevel as IJson)[nextLevelKey] as any, action.o);
    }
    // number
    else if (action.n === JOTActionName.NumberAdd) {
      ((currentLevel as IJson)[nextLevelKey] as number) += action.na;
    }
    // list insert
    else if (action.n === JOTActionName.ListInsert) {
      (currentLevel as any[]).splice(nextLevelKey as number, 0, action.li);
    }
    // list delete
    else if (action.n === JOTActionName.ListDelete) {
      (currentLevel as any[]).splice(nextLevelKey as number, 1);
    }
    // list move
    else if (action.n === JOTActionName.ListMove) {
      if (action.lm != nextLevelKey) {
        const element = (currentLevel as any[])[nextLevelKey as number];
        // Remove it...
        (currentLevel as any[]).splice(nextLevelKey as number, 1);
        // And insert it back.
        (currentLevel as any[]).splice(nextLevelKey as number, 0, element);
      }
    }
    // object insert / replace
    else if (action.n === JOTActionName.ObjectReplace || action.n === JOTActionName.ObjectInsert) {
      (currentLevel as IJson)[nextLevelKey] = action.oi;
    }
    // object delete
    else if (action.n === JOTActionName.ObjectDelete) {
      delete (currentLevel as IJson)[nextLevelKey];
    } else {
      throw new Error('invalid / missing instruction in op');
    }
  }

  return container.data;
}

function pathMatches(pathA: IJOTPath, pathB: IJOTPath, ignoreLast = false): boolean {
  if (pathA.length !== pathB.length) {
    return false;
  }

  for (let i = 0; i < pathA.length; i++) {
    if (pathA[i] !== pathB[i] && (!ignoreLast || i !== pathA.length - 1)) return false;
  }

  return true;
}

export function append(operation: IJOTAction[], action: IJOTAction): void {
  const immutableAction = action;
  const lastIndex = operation.length - 1;

  if (operation.length === 0) {
    operation.push(action);
    return;
  }

  let last = operation[lastIndex];

  if (
    (action.n === JOTActionName.TextInsert || action.n === JOTActionName.TextDelete) &&
    (last.n === JOTActionName.TextInsert || last.n === JOTActionName.TextDelete)
  ) {
    action = convertFromText(action);
    last = convertFromText(last);
  }

  if (pathMatches(action.p, last.p)) {
    // append text
    if (action.n === JOTActionName.SubType && last.n === JOTActionName.SubType && action.t === last.t && subtypes[action.t]) {
      const subTypeOperation: any[] = subtypes[action.t].compose(last.o, action.o);

      if (action.t === 'tot') {
        for (let index = 0; index < operation.length - 1; index++) {
          action = convertToText({
            n: JOTActionName.SubType,
            t: 'tot',
            p: action.p,
            o: [subTypeOperation.pop()],
          });
          operation.push(action);
        }
        last = convertToText({
          n: JOTActionName.SubType,
          t: 'tot',
          p: last.p,
          o: operation,
        });
        operation[lastIndex] = last;
      }
    }
    // append number
    else if (action.n === JOTActionName.NumberAdd && last.n === JOTActionName.NumberAdd) {
      operation[lastIndex] = {
        n: JOTActionName.NumberAdd,
        p: last.p,
        na: last.na + action.na,
      };
    }
    // append list element
    else if (
      (last.n === JOTActionName.ListInsert || last.n === JOTActionName.ListReplace) &&
      action.n === JOTActionName.ListDelete &&
      action.ld === last.li
    ) {
      if (last.n === JOTActionName.ListReplace) {
        last = {
          n: JOTActionName.ListDelete,
          p: last.p,
          ld: last.ld,
        };
        operation[lastIndex] = last;
      } else {
        operation.pop();
      }
    }
    // append object
    else if (last.n === JOTActionName.ObjectDelete && action.n === JOTActionName.ObjectInsert) {
      last = {
        n: JOTActionName.ObjectReplace,
        p: last.p,
        od: last.od,
        oi: action.oi,
      };
      operation[lastIndex] = last;
    }
    // append object
    else if (
      (last.n === JOTActionName.ObjectInsert || last.n === JOTActionName.ObjectReplace) &&
      (action.n === JOTActionName.ObjectDelete || action.n === JOTActionName.ObjectReplace)
    ) {
      if (action.n === JOTActionName.ObjectReplace) {
        last =
          last.n === JOTActionName.ObjectInsert
            ? {
              n: JOTActionName.ObjectInsert,
              p: last.p,
              oi: action.oi,
            }
            : {
              n: last.n,
              p: last.p,
              oi: action.oi,
              od: last.od,
            };
        operation[lastIndex] = last;
      } else if (last.n === JOTActionName.ObjectReplace) {
        last = {
          n: JOTActionName.ObjectDelete,
          p: last.p,
          od: last.od,
        };
        operation[lastIndex] = last;
      } else {
        operation.pop();
      }
    }
    // append list
    else if (action.n === JOTActionName.ListMove && action.p[action.p.length - 1] === action.lm) {
      // don't do anything
    } else {
      operation.push(immutableAction);
    }
  } else {
    operation.push(immutableAction);
  }
}

export function compose(operationA: IJOTAction[], operationB: IJOTAction[]) {
  for (const action of operationB) {
    append(operationA, action);
  }

  return operationA;
}

export function commonLengthForOps(actionA: IJOTAction, actionB: IJOTAction) {
  let aLen = actionA.p.length;
  let bLen = actionB.p.length;

  if (actionA.n === JOTActionName.NumberAdd || actionA.n === JOTActionName.SubType) aLen++;

  if (actionB.n === JOTActionName.NumberAdd || actionB.n === JOTActionName.SubType) bLen++;

  if (aLen === 0) return -1;
  if (bLen === 0) return null;

  aLen--;
  bLen--;

  for (let i = 0; i < aLen; i++) {
    const position = actionA.p[i];
    if (i >= bLen || position !== actionB.p[i]) return null;
  }

  return aLen;
}

export function canOpAffectPath(action: IJOTAction, path: IJOTPath): boolean {
  return commonLengthForOps({ p: path } as any, action) != null;
}

/**
 * transform action so it applies to a json with other action applied.
 *
 * @param json        json
 * @param action      action
 * @param otherAction the impactful action
 * @param type
 * @returns
 */
export function transformAction(operation: IJOTAction[], action: IJOTAction, otherAction: IJOTAction, type: 'left' | 'right'): IJOTAction[] {
  const immutableAction = action;
  const otherActionCommonPathUnderAction = commonLengthForOps(otherAction, action);
  const actionCommonPathUnderOtherAction = commonLengthForOps(action, otherAction);
  let actionPathLength = action.p.length;
  let otherActionPathLength = otherAction.p.length;

  if (action.n === JOTActionName.NumberAdd || action.n === JOTActionName.SubType) {
    actionPathLength++;
  }

  if (otherAction.n === JOTActionName.NumberAdd || otherAction.n === JOTActionName.SubType) {
    otherActionPathLength++;
  }

  // to reflect that change for invertibility.
  if (
    actionCommonPathUnderOtherAction != null &&
    otherActionPathLength > actionPathLength &&
    action.p[actionCommonPathUnderOtherAction] == otherAction.p[actionCommonPathUnderOtherAction]
  ) {
    if (action.n === JOTActionName.ListDelete || action.n === JOTActionName.ListReplace) {
      const oa = clone(otherAction);
      oa.p = oa.p.slice(actionPathLength);
      action =
        action.n === JOTActionName.ListDelete
          ? {
            n: JOTActionName.ListDelete,
            p: action.p,
            ld: apply(clone(action.ld), [oa]),
          }
          : {
            n: JOTActionName.ListReplace,
            p: action.p,
            ld: apply(action.ld, [oa]),
            li: action.li,
          };
    } else if (action.n === JOTActionName.ObjectDelete || action.n === JOTActionName.ObjectReplace) {
      const oa = clone(otherAction);
      oa.p = oa.p.slice(actionPathLength);
      action =
        action.n === JOTActionName.ObjectDelete
          ? {
            n: JOTActionName.ObjectDelete,
            p: action.p,
            od: apply(action.od, [oa]),
          }
          : {
            n: JOTActionName.ObjectReplace,
            p: action.p,
            od: apply(action.od, [oa]),
            oi: action.oi,
          };
    }
  }

  if (otherActionCommonPathUnderAction != null) {
    const commonOperand = actionPathLength === otherActionPathLength;

    // backward compatibility for old string ops
    if (
      (action.n === JOTActionName.TextInsert || action.n === JOTActionName.TextDelete) &&
      (otherAction.n === JOTActionName.TextInsert || otherAction.n === JOTActionName.TextDelete)
    ) {
      action = convertFromText(action);
      otherAction = convertFromText(otherAction);
    }

    if (otherAction.n === JOTActionName.SubType && subtypes[otherAction.t] && action.n === JOTActionName.SubType && action.n === otherAction.t) {
      const subTypeOperation = subtypes[action.t].transform(action.o, otherAction.o, type);

      if (immutableAction.n === JOTActionName.TextDelete || immutableAction.n === JOTActionName.TextInsert) {
        const path = action.p;
        for (const subTypeAction of subTypeOperation) {
          append(operation, convertToText({
            n: JOTActionName.SubType,
            t: 'tot',
            p: path.slice(),
            o: subTypeAction,
          }));
        }
      }

      return operation;
    }
    // transform based on otherC
    else if (otherAction.n === JOTActionName.NumberAdd) {
      // this case is handled below
    }
    else if (otherAction.n === JOTActionName.ListReplace) {
      // 
    }
    else if (otherAction.n === JOTActionName.ListInsert) {
      //
    }
    else if (otherAction.n === JOTActionName.ListDelete) {
      //
    }
    else if (otherAction.n === JOTActionName.ListMove) {
      //
    }
    else if (otherAction.n === JOTActionName.ObjectReplace) {
      //
    }
    else if (otherAction.n === JOTActionName.ObjectInsert) {
      //
    }
    else if (otherAction.n === JOTActionName.ObjectDelete) {
      //
    }
  }
  append(operation, action);
  return operation;
}
