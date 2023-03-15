export function isNumber(variable: number): boolean {
  return typeof variable === 'number';
}

export function isNotNumber(variable: number): boolean {
  return typeof variable !== 'number';
}

export function isString(variable: string): boolean {
  return typeof variable === 'string';
}

export function isNotString(variable: string): boolean {
  return typeof variable !== 'string';
}
