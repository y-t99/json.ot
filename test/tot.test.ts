import { tot } from 'tot';
import { ITOTAction, TOTActionName } from 'tot/action';

describe('text ot type test', () => {
  describe('apply test', () => {
    test('test apply insert', () => {
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
  });
});
