import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IListReplaceAction {
  n: JOTActionName.ListReplace;
  p: IJOTPath;
  ld: any;
  li: any;
}
