import { IStringDeleteAction } from './string.delete.action';
import { IStringInsertAction } from './string.insert.action';

export type ITOTAction = IStringInsertAction | IStringDeleteAction;
