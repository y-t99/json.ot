import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IObjectDeleteAction {
  n: OTActionName.ObjectDelete;
  p: IJOTPath;
  od: any;
}
