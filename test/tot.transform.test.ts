import { tot } from 'tot';
import { IStringDeleteAction, ITOTAction, TOTActionName } from 'tot/action';

describe('transform operation by otherOperation', () => {
  describe('transform insert action by insert action', () => {
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
      const transformOperationA = tot.transform(operationA, operationB, 'left');
      expect(transformOperationA[0].p).toEqual(0);
    });
  });

  describe('transform insert action by delete action', () => {
    test('case 1: transforming action position less than or equals to apply action position.', () => {
      // if init document equals to 'hell ';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 4,
          i: 'o',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 4,
          d: ' ',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(4);
    });

    test('case 2: transforming action position gather than apply action position and position in deleted string.', () => {
      // if init document equals to 'hello World';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 1,
          i: 'Hi',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 0,
          d: 'hello',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(0);
    });

    test('case 3: transforming action position gather than apply action position plus deleted string length.', () => {
      // if init document equals to 'hello World';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 6,
          i: 'Hi ',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 0,
          d: 'hello',
        },
      ];
      const transformOperationA = tot.transform(
        operationA,
        operationB,
        'right'
      );
      expect(transformOperationA[0].p).toEqual(1);
    });
  });

  describe('transform delete action by insert action', () => {
    test('the deleted string in inserted string left', () => {
      // if init document equals to 'hello world';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 0,
          d: 'hello ',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringInsert,
          p: 11,
          i: '!!!',
        },
      ];
      const transformOperationA = tot.transform(operationA, operationB, 'left');
      expect(transformOperationA[0].p).toEqual(0);
    });

    test('the deleted string in inserted string right', () => {
      // if init document equals to 'world!!!';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 5,
          d: '!!!',
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
      expect(transformOperationA[0].p).toEqual(11);
    });
  });

  describe('transform delete action by delete action', () => { 
    test('the deleting string on deleted string left', () => {
      // if init document equals to 'abcdef';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 2,
          d: 'cd',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 4,
          d: 'ef',
        },
      ];
      const transformOperationA = tot.transform(operationA, operationB, 'right');
      expect(transformOperationA[0].p).toEqual(2);
    });

    test('the deleting string on deleted string right', () => {
      // if init document equals to 'abcdef';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 4,
          d: 'ef',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 2,
          d: 'cd',
        },
      ];
      const transformOperationA = tot.transform(operationA, operationB, 'right');
      expect(transformOperationA[0].p).toEqual(2);
    });

    test('the deleting string contain deleted string', () => {
      // if init document equals to 'abcdef';
      const operationA: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 0,
          d: 'abcd',
        },
      ];
      const operationB: ITOTAction[] = [
        {
          n: TOTActionName.StringDelete,
          p: 1,
          d: 'bc',
        },
      ];
      const transformOperationA = tot.transform(operationA, operationB, 'right');
      expect(transformOperationA[0].p).toEqual(0);
      expect((transformOperationA[0] as IStringDeleteAction).d).toEqual('ad');
    });
  });
});
