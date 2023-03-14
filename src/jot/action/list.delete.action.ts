import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IListDeleteAction {
  n: OTActionName.ListDelete;
  p: IJOTPath;
  ld: any;
}
