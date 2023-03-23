import { TOTActionName } from './tot.action.name.enum';

export interface IStringDeleteAction {
  n: TOTActionName.StringDelete;
  p: number;
  d: string;
}
