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

export function checkValidDeletedString(
  action: IStringDeleteAction,
  otherAction: IStringDeleteAction
) {
  const start = Math.max(action.p, otherAction.p);
  const end = Math.min(
    action.p + action.d.length,
    otherAction.p + otherAction.d.length
  );
  const deletingString = action.d.slice(start - action.p, end - action.p);
  const deletedString = otherAction.d.slice(
    start - otherAction.p,
    end - otherAction.p
  );
  if (deletingString !== deletedString)
    throw new Error(
      'Delete ops delete different text in the same region of the document'
    );
}
