import { ITOTAction } from './action';
import IStringDeleteAction from './action/string.delete.action';

export function checkValidTotAction(action: ITOTAction): void {
  if (action.p < 0) throw new Error('position cannot be negative');
}

export function checkValidTotOperation(operation: ITOTAction[]): void {
  for (const action of operation) {
    checkValidTotAction(action);
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
