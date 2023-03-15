import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IObjectInsertAction {
  n: JOTActionName.ObjectInsert;
  p: IJOTPath;
  oi: any;
}
