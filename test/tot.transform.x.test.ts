import { tot } from 'tot';
import { ITOTAction, TOTActionName } from 'tot/action';

describe('transformX operationA and operationB', () => {
  test('let different snapshot converge to the same state.', () => {
    const snapshot = 'AF';
    const serverOperation: ITOTAction[] = [
      {
        n: TOTActionName.StringInsert,
        p: 1,
        i: 'B',
      },
      {
        n: TOTActionName.StringInsert,
        p: 2,
        i: 'C',
      },
    ];
    const clientOperation: ITOTAction[] = [
      {
        n: TOTActionName.StringInsert,
        p: 1,
        i: 'D',
      },
      {
        n: TOTActionName.StringInsert,
        p: 2,
        i: 'E',
      },
    ];
    const serverSnapshot = tot.apply(snapshot, serverOperation);
    const clientSnapshot = tot.apply(snapshot, clientOperation);
    const [leftOperation, rightOperation] = tot.transformX(
      serverOperation,
      clientOperation,
    );
    const client = tot.apply(clientSnapshot, leftOperation);
    const service = tot.apply(serverSnapshot, rightOperation);
    expect(client).toEqual('ABCDEF');
    expect(client).toEqual(service);
  });
});
