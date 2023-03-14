import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IListReplaceAction {
  n: OTActionName.ListReplace;
  p: IJOTPath;
  ld: any;
  li: any;
}
