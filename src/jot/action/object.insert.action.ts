import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IObjectInsertAction {
  n: OTActionName.ObjectInsert;
  p: IJOTPath;
  oi: any;
}
