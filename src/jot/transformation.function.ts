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
import { IJOTAction, ISubTypeAction } from './action';
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
    reversalAction.p = action.p
      .slice(0, action.p.length - 1)
      .concat([action.lm]);
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
  const postion = action.p[action.p.length - 1];
  if(action.n === JOTActionName.TextInsert) {
    return {
      n: JOTActionName.SubType,
      t: 'tot',
      p: path,
      o: {
        n: TOTActionName.StringInsert,
        p: postion,
        i: action.si,
      }
    };
  }
  return {
    n: JOTActionName.SubType,
    t: 'tot',
    p: path,
    o: {
      n: TOTActionName.StringDelete,
      p: postion,
      i: action.sd,
    }
  };
}

export interface Jjson {
  [_: string | number] : string | number | Jjson | number[] | string[] | Jjson[],
}

export function apply(snapshot: Jjson, operation: IJOTAction[]): Jjson {
  const mutableOperation = clone(operation);
  const container: Jjson = {};
  container['data'] = snapshot;

  for (let action of mutableOperation) {
    if(action.n === JOTActionName.TextInsert || action.n === JOTActionName.TextDelete) {
      action = convertFromText(action);
    }

    let previousLevel = null;
    let currentLevelKey: null | string | number = null;
    let currentLevel: Jjson | any[] = container;
    let nextLevelKey: string | number = 'data';

    for (const position of action.p) {
      previousLevel = currentLevel;
      currentLevelKey = nextLevelKey;
      currentLevel = (currentLevel[nextLevelKey]) as Jjson;
      nextLevelKey = position;
    }
    // sub type
    if(action.n === JOTActionName.SubType && subtypes[action.t]) {
      currentLevel[nextLevelKey] = subtypes[action.t].apply(currentLevel[nextLevelKey] as any, action.o);
    }
    // number
    else if(action.n === JOTActionName.NumberAdd) {
      (currentLevel[nextLevelKey] as number) += action.na;
    }
    // list insert
    else if(action.n === JOTActionName.ListInsert) {
      // (currentLevel as any[]).splice((nextLevelKey as number), 0, action.li);
    }
  }
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
export function transformAction(
  json: object,
  action: IJOTAction,
  otherAction: IJOTAction,
  type: 'left' | 'right'
): object {
  const mutableAction = clone(action);

  return {};
}
