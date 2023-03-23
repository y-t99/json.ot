import { IOTType } from 'ot.interface';

export interface IJotTypeExtension {
  subtypes: IOTType<any, any>[],
  registerSubType: (type: IOTType<any, any>) => void,
}