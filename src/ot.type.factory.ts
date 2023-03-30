export function createOTTypeTransformFunction<T>(
  transformAction: (context: T[], leftAction: T, rightAction: T, type: 'left' | 'right') => T[],
  append: (operation: T[], action: T) => void
): {
  transformX: (leftOperation: T[], rightOperation: T[]) => [T[], T[]];
  transform: (operation: T[], otherOperation: T[], type: 'left' | 'right') => T[];
} {
  const transformActionX = (left: T, right: T, contextLeft: T[], contextRight: T[]) => {
    transformAction(contextLeft, left, right, 'left');
    transformAction(contextRight, right, left, 'right');
  };

  /**
   * transform left operation and right operation, let them under same context.
   * @param leftOperation       the left operation under version 1 context
   * @param rightOperation      the right operation under version 2 context
   * @returns the left operation and the right operation both version 3 context
   */
  const transformX = (leftOperation: T[], rightOperation: T[]): [T[], T[]] => {
    const mutableRightOperation: T[] = [];

    for (const action of rightOperation) {
      let rightAction: T | null = action;

      const mutableLeftOperation: T[] = [];

      let i = 0;

      while (i < leftOperation.length) {
        const nextAction: T[] = [];

        transformActionX(leftOperation[i], rightAction, mutableLeftOperation, nextAction);
        i++;

        if (nextAction.length === 1) {
          rightAction = nextAction[0];
        } else if (nextAction.length === 0) {
          for (let j = i; j < leftOperation.length; j++) {
            append(mutableLeftOperation, leftOperation[j]);
          }
          rightAction = null;
          break;
        } else {
          const pair = transformX(leftOperation.slice(i), nextAction);
          for (const transformLeftAction of pair[0]) {
            append(mutableLeftOperation, transformLeftAction);
          }
          for (const transformRightAction of pair[1]) {
            append(mutableRightOperation, transformRightAction);
          }
          rightAction = null;
          break;
        }
      }
      if (rightAction != null) {
        append(mutableRightOperation, rightAction);
      }
      leftOperation = mutableLeftOperation;
    }
    return [leftOperation, mutableRightOperation];
  };

  const transform = (operation: T[], otherOperation: T[], type: 'left' | 'right'): T[] => {
    if (!(type === 'left' || type === 'right')) throw new Error("type must be 'left' or 'right'");

    if (otherOperation.length === 0) {
      return operation;
    }

    if (operation.length === 1 && otherOperation.length === 1) return transformAction([], operation[0], otherOperation[0], type);

    if (type === 'left') return transformX(operation, otherOperation)[0];

    return transformX(otherOperation, operation)[1];
  };

  return {
    transformX,
    transform,
  };
}
