import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IObjectReplaceAction {
  n: OTActionName.ObjectReplace;
  p: IJOTPath;
  od: any;
  oi: any;
}
