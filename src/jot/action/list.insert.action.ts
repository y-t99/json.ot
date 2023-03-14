import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IListInsertAction {
  n: OTActionName.ListInsert;
  p: IJOTPath;
  li: any;
}
