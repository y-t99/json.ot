import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IObjectDeleteAction {
  n: JOTActionName.ObjectDelete;
  p: IJOTPath;
  od: any;
}
