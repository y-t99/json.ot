import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface IListMoveAction {
  n: OTActionName.ListMove;
  p: IJOTPath;
  lm: number;
}
