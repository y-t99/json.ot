import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IObjectReplaceAction {
  n: JOTActionName.ObjectReplace;
  p: IJOTPath;
  od: any;
  oi: any;
}
