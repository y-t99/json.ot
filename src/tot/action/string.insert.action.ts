import { TOTActionName } from './tot.action.name.enum';

export interface IStringInsertAction {
  n: TOTActionName.StringInsert;
  p: number;
  i: string;
}
