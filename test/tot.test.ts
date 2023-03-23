import { tot } from 'tot';
import {
  ITOTAction,
  TOTActionName,
  IStringDeleteAction,
  IStringInsertAction,
} from 'tot/action';

describe('text ot type test', () => {
  describe('apply operation to snapshot test', () => {
    test('test apply insert left', () => {
      const operation: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'hello',
        },
      ];
      const result = tot.apply(' world', operation);
      expect(result).toEqual('hello world');
    });

    test('test apply insert right', () => {
      const operation: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 6,
          i: 'world',
        },
      ];
      const result = tot.apply('hello ', operation);
      expect(result).toEqual('hello world');
    });

    test('test apply insert middle', () => {
      const operation: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 4,
          i: 'o w',
        },
      ];
      const result = tot.apply('hellorld', operation);
      expect(result).toEqual('hello world');
    });
  });

  describe('compose operation test', () => {
    test('apply(apply(S, A), B) == apply(S, compose(A, B))', () => {
      const snapshot = 'AD';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'B',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 2,
          i: 'C',
        },
      ];
      const snapshotA = tot.apply(tot.apply(snapshot, operationA), operationB);
      const snapshotB = tot.apply(
        snapshot,
        tot.compose(operationA, operationB)
      );
      expect(snapshotA === snapshotB).toBeTruthy();
    });

    test('insert and insert merge one insert when exist intersection in two action', () => {
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'B',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 2,
          i: 'C',
        },
      ];
      const combination = tot.compose(operationA, operationB);
      expect(combination.length).toEqual(1);
    });

    test('insert and insert not merge when not exist intersection in two action', () => {
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'B',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 3,
          i: 'C',
        },
      ];
      const combination = tot.compose(operationA, operationB);
      expect(combination.length).toEqual(2);
    });

    test('delete and delete merge one delete when exist intersection in two action', () => {
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 1,
          d: 'B',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 1,
          d: 'C',
        },
      ];
      const combination = tot.compose(operationA, operationB);
      expect(combination.length).toEqual(1);
    });

    test('delete and delete not merge when not exist intersection in two action', () => {
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 1,
          d: 'B',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 3,
          d: 'C',
        },
      ];
      const combination = tot.compose(operationA, operationB);
      expect(combination.length).toEqual(2);
    });
  });

  describe('invert operation', () => {
    test('invert insert action', () => {
      const operation: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'abc',
        },
      ];
      const reversalAction = tot.invert(operation);
      expect(reversalAction[0].n).toEqual(TOTActionName.StringDelete);
      expect(reversalAction[0].p).toEqual(0);
      expect((reversalAction[0] as IStringDeleteAction).d).toEqual('abc');
    });

    test('invert delete action', () => {
      const operation: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 0,
          d: 'abc',
        },
      ];
      const reversalAction = tot.invert(operation);
      expect(reversalAction[0].n).toEqual(TOTActionName.StringInsert);
      expect(reversalAction[0].p).toEqual(0);
      expect((reversalAction[0] as IStringInsertAction).i).toEqual('abc');
    });
  });

  describe('transform operation by otherOperation', () => {
    test('right transform insert action by insert action, case 1: transforming action position gather than apply action position.', () => {
      // if init document equals to ' ';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'world',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'hello',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(6);
    });

    test('right transform insert action by insert action, case 2: transforming action position less than apply action position.', () => {
      // if init document equals to ' ';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'hello',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'world',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(0);
    });

    test('right transform insert action by insert action, case 3: transforming action position equals to apply action position.', () => {
      // if init document equals to '';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'world',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'hello ',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(6);
    });

    test('left transform insert action by insert action, case 4: transforming action position equals to apply action position.', () => {
      // if init document equals to '';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'hello ',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 0,
          i: 'world',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'left'
      );
      expect(transformOperationA[0].p).toEqual(0);
    });
  });
});
