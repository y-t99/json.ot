import { JOTActionName } from './jot.action.name.enum';
import { IJOTPath } from './jot.path';

export interface ITextDeleteAction {
  n: JOTActionName.TextDelete;
  p: IJOTPath;
  sd: string;
}
