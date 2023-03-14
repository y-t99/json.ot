import IListDeleteAction from './list.delete.action';
import IListInsertAction from './list.insert.action';
import IListMoveAction from './list.move.action';
import IListReplaceAction from './list.replace.action';
import INumberAddAction from './number.add.action';
import IObjectDeleteAction from './object.delete.action';
import IObjectInsertAction from './object.insert.action';
import IObjectReplaceAction from './object.replace.action';

export type IJOTAction =
  | INumberAddAction
  | IListInsertAction
  | IListDeleteAction
  | IListReplaceAction
  | IListMoveAction
  | IObjectInsertAction
  | IObjectDeleteAction
  | IObjectReplaceAction;
