import { tot } from 'tot';
import { ITOTAction, TOTActionName } from 'tot/action';

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
      const opeartionA: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 1,
        i: 'B',
      }];
      const operationB: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 2,
        i: 'C',
      }];
      const snapshotA = tot.apply(tot.apply(snapshot, opeartionA), operationB);
      const snapshotB = tot.apply(snapshot, tot.compose(opeartionA, operationB));
      expect(snapshotA === snapshotB).toBeTruthy();
    });

    test('insert and insert meger one insert when exist intersection in two action', () => {
      const opeartionA: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 1,
        i: 'B',
      }];
      const operationB: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 2,
        i: 'C',
      }];
      const combination = tot.compose(opeartionA, operationB);
      expect(combination.length).toEqual(1);
    });

    test('insert and insert not meger when not exist intersection in two action', () => {
      const opeartionA: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 1,
        i: 'B',
      }];
      const operationB: ITOTAction[] = [{
        n: TOTActionName.StringInsert,
        p: 3,
        i: 'C',
      }];
      const combination = tot.compose(opeartionA, operationB);
      expect(combination.length).toEqual(2);
    });

    test('delete and delete meger one delete when exist intersection in two action', () => {
      const opeartionA: ITOTAction[] = [{
        n: TOTActionName.StringDelete,
        p: 1,
        d: 'B',
      }];
      const operationB: ITOTAction[] = [{
        n: TOTActionName.StringDelete,
        p: 1,
        d: 'C',
      }];
      const combination = tot.compose(opeartionA, operationB);
      expect(combination.length).toEqual(1);
    });

    test('delete and delete not meger when not exist intersection in two action', () => {
      const opeartionA: ITOTAction[] = [{
        n: TOTActionName.StringDelete,
        p: 1,
        d: 'B',
      }];
      const operationB: ITOTAction[] = [{
        n: TOTActionName.StringDelete,
        p: 3,
        d: 'C',
      }];
      const combination = tot.compose(opeartionA, operationB);
      expect(combination.length).toEqual(2);
    });
  });
});
