import { TOTActionName } from './tot.action.name.enum';

export default interface IStringDeleteAction {
  n: TOTActionName.StringDelete;
  p: number;
  d: string;
}
