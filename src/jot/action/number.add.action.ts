import { IJOTPath } from './jot.path';
import { JOTActionName } from './jot.action.name.enum';

export default interface INumberAddAction {
  n: JOTActionName.NumberAdd;
  p: IJOTPath;
  na: number;
}
