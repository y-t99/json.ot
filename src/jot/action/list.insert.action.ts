import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IListInsertAction {
  n: JOTActionName.ListInsert;
  p: IJOTPath;
  li: any;
}
