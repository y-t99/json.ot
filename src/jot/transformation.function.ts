/**
 * Transformation functions are responsible for performing actual transformations on the target operation
 * according to the impact of the reference operation.
 * Transformation functions are dependent on the types and parameters of operations, and data and operation model of the OT system.
 * Transformation functions produce output operations for control algorithms.
 */
import { IJOTAction } from './action';
import { clone } from 'util';

const subtypes = [];
export function registerSubtype(subtype: any) {
  subtypes[subtype.name] = subtype;
}

export function invertAction(action: IJOTAction): IJOTAction {
  const reversalAction: { [key: string]: any } = { p: action.p };

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

export function invertOperation(operation: IJOTAction[]): IJOTAction[] {
  const reversedOperation = operation.slice().reverse();
  const invertedOperation = [];
  for (let i = 0; i < reversedOperation.length; i++) {
    invertedOperation.push(invertAction(reversedOperation[i]));
  }
  return invertedOperation;
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
