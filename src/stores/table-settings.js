import { reaction } from 'mobx';
import { types, getParent, addDisposer } from 'mobx-state-tree';
import { message } from 'antd';

const TableSettings = types
  .model('TableSettings', {
    columns: types.optional(
      types.array(types.string),
      [],
    ),
    tableType: types.optional(
      types.enumeration(['folded', 'unfolded']),
      'unfolded',
    ),
    paginate: false,
    pageSize: 50,
    controls: true,
    folded: false,
    header: true,
    footer: true,
    current: 1,
    total: 0,
    nested: types.maybe(types.late(() => TableSettings)),
  })
  .views(self => ({
    get parent() {
      return getParent(self, 2);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer = reaction(
        () => [
          self.current,
          self.pageSize,
        ],
        () => self.parent.fetchData(),
      );
      addDisposer(self, disposer);
    },
    setFolding(mode) {
      self.tableType = mode;
      switch (mode) {
        case 'unfolded': {
          self.folded = false;
          self.nested.controls = false;
          self.nested.paginate = false;
          break;
        }
        case 'folded': {
          self.folded = true;
          self.nested.controls = true;
          self.nested.paginate = true;
          break;
        }
        default:
          message.error('Неподдерживаемый режим отображения');
      }
    },
    setPagination({ current, pageSize }) {
      self.current = current;
      self.pageSize = pageSize;
    },
  }));

export default TableSettings;
