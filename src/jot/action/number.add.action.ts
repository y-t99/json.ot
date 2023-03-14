import { IJOTPath } from './jot.path';
import { OTActionName } from './ot.action.name.enum';

export default interface INumberAddAction {
  n: OTActionName.NumberAdd;
  p: IJOTPath;
  na: number;
}
