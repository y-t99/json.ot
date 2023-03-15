import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface IListMoveAction {
  n: JOTActionName.ListMove;
  p: IJOTPath;
  lm: number;
}
