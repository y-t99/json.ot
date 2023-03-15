import { TOTActionName } from './tot.action.name.enum';

export default interface IStringInsertAction {
  n: TOTActionName.StringInsert;
  p: number;
  i: string;
}
