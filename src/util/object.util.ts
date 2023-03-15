export function clone<Type>(obj: Type): Type{
  return JSON.parse(JSON.stringify(obj));
}
