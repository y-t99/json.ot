import { jot } from 'jot';
import { IJOTAction, JOTActionName } from 'jot/action';
import { IJson } from 'jot/transformation.function';

describe('json ot type test', () => {
  describe('test text', () => {
    it('should be apply string insert and string delete', () => {
      const snapshot = {
        cell: {
          text: 'abc',
        },
      };
      const stringInsertOperation: IJOTAction = {
        n: JOTActionName.TextInsert,
        p: ['cell', 'text', 3],
        si: 'd',
      };
      const stringDeleteOperation: IJOTAction = {
        n: JOTActionName.TextDelete,
        p: ['cell', 'text', 0],
        sd: 'a',
      };
      const versionA = jot.apply(snapshot, [stringInsertOperation]);
      const versionB = jot.apply(versionA, [stringDeleteOperation]);
      expect((versionB.cell as IJson).text).toEqual('bcd');
    });
    it('should be transform when conflict', () => {
      const snapshot = {
        cell: {
          text: 'abc',
        },
      };
      const serverOperation: IJOTAction = {
        n: JOTActionName.TextInsert,
        p: ['cell', 'text', 0],
        si: 'ab',
      };
      const clientOperation: IJOTAction = {
        n: JOTActionName.TextInsert,
        p: ['cell', 'text', 0],
        si: 'cd',
      };
      const [leftOperation, rightOperation] = jot.transformX([serverOperation], [clientOperation]);
      const clientSnapshot = jot.apply(snapshot, [clientOperation, ...leftOperation]);
      const serverSnapshot = jot.apply(snapshot, [serverOperation, ...rightOperation]);
      expect((serverSnapshot.cell as IJson).text).toEqual((clientSnapshot.cell as IJson).text);
      expect((clientSnapshot.cell as IJson).text).toEqual('abcdabc');
    });
  });

  describe('test list', () => {
    it('should be insert/delete/move/replace element into/ /from/ list', () => {
      const snapshot = {
        cell: {
          list: [1, 2, 3],
        },
      };
      const listInsert: IJOTAction = {
        n: JOTActionName.ListInsert,
        p: ['cell', 'list', 0],
        li: 0,
      };
      const versionA = jot.apply(snapshot, [listInsert]);
      expect((versionA.cell as IJson).list).toEqual([0, 1, 2, 3]);
      const listDelete: IJOTAction = {
        n: JOTActionName.ListDelete,
        p: ['cell', 'list', 3],
        ld: 3,
      };
      const versionB = jot.apply(versionA, [listDelete]);
      expect((versionB.cell as IJson).list).toEqual([0, 1, 2]);
      const listMove: IJOTAction = {
        n: JOTActionName.ListMove,
        p: ['cell', 'list', 0],
        lm: 2,
      };
      const versionC = jot.apply(versionB, [listMove]);
      expect((versionC.cell as IJson).list).toEqual([1, 2, 0]);
      const listReplace: IJOTAction = {
        n: JOTActionName.ListReplace,
        p: ['cell', 'list', 2],
        ld: 0,
        li: 3,
      };
      const versionD = jot.apply(versionC, [listReplace]);
      expect((versionD.cell as IJson).list).toEqual([1, 2, 3]);
    });

    describe('should be transform when conflict', () => {
      it('insert and insert', () => {
        const snapshot = {
          cell: {
            list: [1, 2, 3],
          },
        };
        const serverOperation: IJOTAction = {
          n: JOTActionName.ListInsert,
          p: ['cell', 'list', 0],
          li: 0,
        };
        const clientOperation: IJOTAction = {
          n: JOTActionName.ListInsert,
          p: ['cell', 'list', 3],
          li: 4,
        };
        const [leftOperation, rightOperation] = jot.transformX([serverOperation], [clientOperation]);
        const clientSnapshot = jot.apply(snapshot, [clientOperation, ...leftOperation]);
        const serverSnapshot = jot.apply(snapshot, [serverOperation, ...rightOperation]);
        expect((serverSnapshot.cell as IJson).list).toEqual((clientSnapshot.cell as IJson).list);
        expect((clientSnapshot.cell as IJson).list).toEqual([0, 1, 2, 3, 4]);
      });
    });
  });

  describe('test object', () => {
    it('should be insert/delete/replace object', () => {
      const snapshot = {
        row: {
          cell1: 'text',
          cell2: 'text',
        }
      };
      const objectInsert: IJOTAction = {
        n: JOTActionName.ObjectInsert,
        p: ['row', 'cell0'],
        oi: 'text',
      }
      const versionA = jot.apply(snapshot, [objectInsert]);
      expect((versionA.row as IJson).cell0).toEqual('text');
      const objectDelete: IJOTAction = {
        n: JOTActionName.ObjectDelete,
        p: ['row', 'cell2'],
        od: 'text',
      };
      const versionB = jot.apply(versionA, [objectDelete]);
      expect((versionB.row as IJson).cell2).toBeUndefined();
      const objectReplace: IJOTAction = {
        n: JOTActionName.ObjectReplace,
        p: ['row', 'cell1'],
        od: 'text',
        oi: {
          text: '1',
        },
      };
      const versionC = jot.apply(versionA, [objectReplace]);
      expect((versionC.row as IJson).cell1).toEqual({text: '1'});
    });
  });
});
