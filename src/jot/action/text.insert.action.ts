import { JOTActionName } from './jot.action.name.enum';
import { IJOTPath } from './jot.path';

export interface ITextInsertAction {
  n: JOTActionName.TextInsert;
  p: IJOTPath;
  si: string;
}
