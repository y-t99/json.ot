import { JOTActionName } from './action/jot.action.name.enum';
import { ITextDeleteAction } from './action/text.delete.action';
import { ITextInsertAction } from './action/text.insert.action';
import { IOTType } from 'ot.interface';
import { IJOTAction, IJOTPath, ISubTypeAction } from './action';
import { clone } from 'utils';
import { TOTActionName } from 'tot/action';
import { tot } from 'tot';

const subtypes: { [_: string]: IOTType<any, any> } = {};
function registerSubtype(subtype: IOTType<any, any>) {
  subtypes[subtype.name] = subtype;
}

registerSubtype(tot);

export function invertAction(action: IJOTAction): IJOTAction {
  const reversalAction: { [key: string]: any } = { p: action.p };

  if (action.n === JOTActionName.SubType && subtypes[action.t]) {
    reversalAction.n = JOTActionName.SubType;
    reversalAction.t = action.t;
    reversalAction.o = subtypes[action.t].invert(action.o);
  }

  if ('si' in action) {
    reversalAction.n = JOTActionName.TextDelete;
    reversalAction.sd = action.si;
  }
  if ('sd' in action) {
    reversalAction.n = JOTActionName.TextInsert;
    reversalAction.si = action.sd;
  }
  if ('oi' in action) {
    reversalAction.n = JOTActionName.ObjectDelete;
    reversalAction.od = action.oi;
  }
  if ('od' in action) {
    if ('od' in reversalAction) {
      reversalAction.n = JOTActionName.ObjectReplace;
    } else {
      reversalAction.n = JOTActionName.ObjectInsert;
    }
    reversalAction.oi = action.od;
  }
  if ('li' in action) {
    reversalAction.n = JOTActionName.ListDelete;
    reversalAction.ld = action.li;
  }
  if ('ld' in action) {
    if ('ld' in reversalAction) {
      reversalAction.n = JOTActionName.ListReplace;
    } else {
      reversalAction.n = JOTActionName.ListInsert;
    }
    reversalAction.li = action.ld;
  }
  if ('na' in action) {
    reversalAction.n = JOTActionName.NumberAdd;
    reversalAction.na = -action.na;
  }

  if ('lm' in action) {
    reversalAction.n = JOTActionName.ListMove;
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
        d: action.sd,
      },
    ],
  };
}

function convertToText(action: ISubTypeAction): ITextInsertAction | ITextDeleteAction {
  const path = action.p.slice();
  path.push(action.o[0].p);
  if (action.o[0].n === TOTActionName.StringInsert) {
    return {
      n: JOTActionName.TextInsert,
      p: path,
      si: action.o[0].i,
    };
  }
  return {
    n: JOTActionName.TextDelete,
    p: path,
    sd: action.o[0].d,
  };
}

export interface IJson {
  [_: string | number]: JsonValue;
}

export type JsonValue = string | number | IJson | any[];

export function apply(snapshot: IJson, operation: IJOTAction[]): IJson {
  return applyOperation(snapshot, operation) as IJson;
}

function applyOperation(snapshot: IJson | any[], operation: IJOTAction[]): IJson | any[] {
  const mutableSnapshot = clone(snapshot);
  const mutableOperation = clone(operation);

  const container = {
    data: mutableSnapshot,
  };

  for (let action of mutableOperation) {
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
    // list replace
    else if (action.n === JOTActionName.ListReplace) {
      (currentLevel as IJson)[nextLevelKey] = action.li;
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
        (currentLevel as any[]).splice(action.lm, 0, element);
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
        for (let index = 0; index < subTypeOperation.length - 1; index++) {
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
          o: subTypeOperation,
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
 * @param operation     snapshot
 * @param action        action
 * @param otherAction   the impactful action
 * @param type
 * @returns
 */
export function transformAction(operation: IJOTAction[], action: IJOTAction, otherAction: IJOTAction, type: 'left' | 'right'): IJOTAction[] {
  const immutableAction = action;
  const actionIsOtherActionSubPart = commonLengthForOps(otherAction, action);
  const otherActionIsActionSubPart = commonLengthForOps(action, otherAction);
  let actionPathLength = action.p.length;
  let otherActionPathLength = otherAction.p.length;

  if (action.n === JOTActionName.NumberAdd || action.n === JOTActionName.SubType) {
    actionPathLength++;
  }

  if (otherAction.n === JOTActionName.NumberAdd || otherAction.n === JOTActionName.SubType) {
    otherActionPathLength++;
  }

  // to reflect that change for invertibility. ✅
  if (
    otherActionIsActionSubPart != null &&
    otherActionPathLength > actionPathLength &&
    action.p[otherActionIsActionSubPart] == otherAction.p[otherActionIsActionSubPart]
  ) {
    if (action.n === JOTActionName.ListDelete || action.n === JOTActionName.ListReplace) {
      const oa = clone(otherAction);
      oa.p = oa.p.slice(actionPathLength);
      action =
        action.n === JOTActionName.ListDelete
          ? {
            n: JOTActionName.ListDelete,
            p: action.p,
            ld: applyOperation(clone(action.ld), [oa]),
          }
          : {
            n: JOTActionName.ListReplace,
            p: action.p,
            ld: applyOperation(action.ld, [oa]),
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
            od: applyOperation(action.od, [oa]),
          }
          : {
            n: JOTActionName.ObjectReplace,
            p: action.p,
            od: applyOperation(action.od, [oa]),
            oi: action.oi,
          };
    }
  }

  if (actionIsOtherActionSubPart != null) {
    const commonOperand = actionPathLength === otherActionPathLength;

    // backward compatibility for old string ops ✅
    if (
      (action.n === JOTActionName.TextInsert || action.n === JOTActionName.TextDelete) &&
      (otherAction.n === JOTActionName.TextInsert || otherAction.n === JOTActionName.TextDelete)
    ) {
      action = convertFromText(action);
      otherAction = convertFromText(otherAction);
    }
    // ✅
    if (otherAction.n === JOTActionName.SubType &&
      subtypes[otherAction.t] &&
      action.n === JOTActionName.SubType &&
      action.t === otherAction.t) {
      const subTypeOperation = subtypes[action.t].transform(action.o, otherAction.o, type);

      if (immutableAction.n === JOTActionName.TextDelete || immutableAction.n === JOTActionName.TextInsert) {
        const path = action.p;
        for (const subTypeAction of subTypeOperation) {
          append(
            operation,
            convertToText({
              n: JOTActionName.SubType,
              t: 'tot',
              p: path,
              o: [subTypeAction],
            })
          );
        }
      }

      return operation;
    }
    // ✅
    else if (otherAction.n === JOTActionName.NumberAdd) {
      // this case is handled below
    }
    // ✅
    else if (otherAction.n === JOTActionName.ListReplace) {
      if (otherAction.p[actionIsOtherActionSubPart] === action.p[actionIsOtherActionSubPart]) {
        if (!commonOperand) {
          // noop because element has be remove.
          return operation;
        } else if (action.n === JOTActionName.ListDelete || action.n === JOTActionName.ListReplace) {
          // we're trying to delete the same element, -> noop
          if (action.n === JOTActionName.ListReplace && type === 'left') {
            // we're both replacing one element with another. only one can survive
            action = {
              n: JOTActionName.ListReplace,
              p: action.p,
              li: action.ld,
              ld: clone(otherAction.li),
            };
          } else {
            // noop
            return operation;
          }
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ListInsert) {
      if (
        action.n === JOTActionName.ListInsert &&
        commonOperand &&
        action.p[actionIsOtherActionSubPart] === otherAction.p[actionIsOtherActionSubPart]
      ) {
        // in li vs. li, left wins.
        if (type === 'right') {
          const path = action.p.slice();
          (path[actionIsOtherActionSubPart] as number)++;
          action = {
            ...action,
            p: path,
          };
        }
      } else if (otherAction.p[actionIsOtherActionSubPart] <= action.p[actionIsOtherActionSubPart]) {
        const path = action.p.slice();
        (path[actionIsOtherActionSubPart] as number)++;
        action = {
          ...action,
          p: path,
        };
      }

      if (action.n === JOTActionName.ListMove) {
        if (commonOperand) {
          // otherC edits the same list we edit
          if ((otherAction.p[actionIsOtherActionSubPart] as number) <= action.lm) {
            action = {
              ...action,
              lm: action.lm + 1,
            };
          }
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ListDelete) {
      if (action.n === JOTActionName.ListMove) {
        if (commonOperand) {
          if (otherAction.p[actionIsOtherActionSubPart] === action.p[actionIsOtherActionSubPart]) {
            // they deleted the thing we're trying to move
            return operation;
          }
          // otherAction edits the same list we edit fix: bug?
          const position = otherAction.p[actionIsOtherActionSubPart] as number;
          const from = action.p[actionIsOtherActionSubPart] as number;
          const to = action.lm;
          if (position < to || (position === to && from < to))
            action = {
              ...action,
              lm: action.lm - 1,
            };
        }
      }

      if (otherAction.p[actionIsOtherActionSubPart] < action.p[actionIsOtherActionSubPart]) {
        const path = action.p.slice();
        (path[actionIsOtherActionSubPart] as number)--;
        action = {
          ...action,
          p: path,
        };
      } else if (otherAction.p[actionIsOtherActionSubPart] === action.p[actionIsOtherActionSubPart]) {
        if (otherActionPathLength < actionPathLength) {
          // we're below the deleted element, so -> noop
          return operation;
        } else if (action.n === JOTActionName.ListDelete || action.n === JOTActionName.ListReplace) {
          if (action.n === JOTActionName.ListReplace) {
            // we're replacing, they're deleting. we become an insert.
            action = {
              n: JOTActionName.ListInsert,
              p: action.p,
              li: action.li,
            };
          } else {
            // we're trying to delete the same element, -> noop
            return operation;
          }
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ListMove) {
      if (action.n === JOTActionName.ListMove && commonOperand) {
        // lm vs lm, here we go!
        const from = action.p[actionIsOtherActionSubPart] as number;
        const to = action.lm;
        const otherFrom = otherAction.p[actionIsOtherActionSubPart] as number;
        const otherTo = otherAction.lm;
        if (otherFrom !== otherTo) {
          // if otherFrom == otherTo, we don't need to change our op.

          // where did my thing go?
          if (from === otherFrom) {
            // they moved it! tie break.
            if (type === 'left') {
              const path = action.p.slice();
              path[actionIsOtherActionSubPart] = otherTo;
              action = {
                ...action,
                p: path,
              };
              if (from === to)
                // ugh
                action.lm = otherTo;
            } else {
              return operation;
            }
          } else {
            // they moved around it
            const path = action.p.slice();
            action = {
              ...action,
              p: path,
            };
            if (from > otherFrom) {
              (action.p[actionIsOtherActionSubPart] as number)--;
            }
            if (from > otherTo) {
              (action.p[actionIsOtherActionSubPart] as number)++;
            } else if (from === otherTo) {
              if (otherFrom > otherTo) {
                (action.p[actionIsOtherActionSubPart] as number)++;
                if (from === to)
                  // ugh, again
                  action.lm++;
              }
            }

            // step 2: where am i going to put it?
            if (to > otherFrom) {
              action.lm--;
            } else if (to === otherFrom) {
              if (to > from) action.lm--;
            }
            if (to > otherTo) {
              action.lm++;
            } else if (to === otherTo) {
              // if we're both moving in the same direction, tie break
              if ((otherTo > otherFrom && to > from) || (otherTo < otherFrom && to < from)) {
                if (type === 'right') action.lm++;
              } else {
                if (to > from) action.lm++;
                else if (to === otherFrom) action.lm--;
              }
            }
          }
        }
      } else if (action.n === JOTActionName.ListInsert && commonOperand) {
        // li
        const from = otherAction.p[actionIsOtherActionSubPart] as number;
        const to = otherAction.lm;
        const position = action.p[actionIsOtherActionSubPart] as number;
        const path = action.p.slice();
        action = {
          ...action,
          p: path,
        };
        if (position > from) (action.p[actionIsOtherActionSubPart] as number)--;
        if (position > to) (action.p[actionIsOtherActionSubPart] as number)++;
      } else {
        // ld, ld+li, si, sd, na, oi, od, oi+od, any li on an element beneath
        // the lm
        //
        // i.e. things care about where their item is after the move.
        const from = otherAction.p[actionIsOtherActionSubPart] as number;
        const to = otherAction.lm;
        const position = action.p[actionIsOtherActionSubPart] as number;
        const path = action.p.slice();
        action = {
          ...action,
          p: path,
        };
        if (position === from) {
          action.p[actionIsOtherActionSubPart] = to;
        } else {
          if (position > from) (action.p[actionIsOtherActionSubPart] as number)--;
          if (position > to) (action.p[actionIsOtherActionSubPart] as number)++;
          else if (position === to && from > to) (action.p[actionIsOtherActionSubPart] as number)++;
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ObjectReplace) {
      if (action.p[actionIsOtherActionSubPart] === otherAction.p[actionIsOtherActionSubPart]) {
        if ((action.n === JOTActionName.ObjectInsert || action.n === JOTActionName.ObjectReplace) && commonOperand) {
          // we inserted where someone else replaced
          if (type === 'right') {
            // left wins
            return operation;
          }
          // we win, make our op replace what they inserted
          action = {
            n: JOTActionName.ObjectReplace,
            p: action.p,
            oi: action.oi,
            od: otherAction.oi,
          };
        } else {
          // -> noop if the other component is deleting the same object (or any parent)
          return operation;
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ObjectInsert) {
      if (
        (action.n === JOTActionName.ObjectInsert || action.n === JOTActionName.ObjectReplace) &&
        action.p[actionIsOtherActionSubPart] === otherAction.p[actionIsOtherActionSubPart]
      ) {
        // left wins if we try to insert at the same place
        if (type === 'left') {
          append(operation, { n: JOTActionName.ObjectDelete, p: action.p, od: otherAction.oi });
        } else {
          return operation;
        }
      }
    }
    // ✅
    else if (otherAction.n === JOTActionName.ObjectDelete) {
      if (action.p[actionIsOtherActionSubPart] == otherAction.p[actionIsOtherActionSubPart]) {
        if (!commonOperand) return operation;
        if (action.n === JOTActionName.ObjectInsert || action.n === JOTActionName.ObjectReplace) {
          action = {
            n: JOTActionName.ObjectInsert,
            p: action.p,
            oi: action.oi,
          };
        } else {
          return operation;
        }
      }
    }
  }
  append(operation, action);
  return operation;
}
