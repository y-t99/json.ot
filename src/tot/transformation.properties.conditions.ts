import { isNotNumber, isNotString } from 'util';
import { ITOTAction } from './action';
import IStringDeleteAction from './action/string.delete.action';
import IStringInsertAction from './action/string.insert.action';

export function checkValidTotAction(action: ITOTAction): void {
  if (isNotNumber(action.p))
    throw new Error('component missing position field');

  if (
    isNotString((action as IStringInsertAction).i) ===
    isNotString((action as IStringDeleteAction).d)
  )
    throw new Error('component needs an i or d field');

  if (action.p < 0) throw new Error('position cannot be negative');
}

export function checkValidTotOperation(operation: ITOTAction[]): void {
  for (let i = 0; i < operation.length; i++) {
    checkValidTotAction(operation[i]);
  }
}