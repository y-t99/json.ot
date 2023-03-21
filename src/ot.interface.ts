export interface IOTType<T, R> {
  name: string,

  transform: (operation: T[], otherOperation: T[], type: 'left' | 'right') => T[],

  apply: (snapshot: string, operation: T[]) => R,

  compose: (operationA: T[], operationB: T[]) => T[],

  invert: (operation: T[]) => T[],
}