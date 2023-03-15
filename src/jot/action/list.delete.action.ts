import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IListDeleteAction {
  n: JOTActionName.ListDelete;
  p: IJOTPath;
  ld: any;
}
