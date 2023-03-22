export function insert(
  destinedString: string,
  position: number,
  insertedString: string
): string {
  return `${destinedString.slice(
    0,
    position
  )}${insertedString}${destinedString.slice(position)}`;
}
