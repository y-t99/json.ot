import { JOTActionName } from './jot.action.name.enum';
import { IJOTPath } from './jot.path';

export interface ISubTypeAction {
  n: JOTActionName.SubType;
  p: IJOTPath;
  t: string;
  o: any[];
}
