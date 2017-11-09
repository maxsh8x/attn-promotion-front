import { types, getParent } from 'mobx-state-tree';
import { message } from 'antd';

const TableSettings = types
  .model('TableSettings', {
    columns: types.optional(
      types.array(types.string),
      [],
    ),
    tableType: types.optional(
      types.enumeration(['folded', 'unfolded']),
      'folded',
    ),
    paginate: false,
    pageSize: 1,
    header: true,
    footer: true,
    nested: types.maybe(types.late(() => TableSettings)),
    current: 1,
    total: 0,
  })
  .views(self => ({
    get parent() {
      return getParent(self, 2);
    },
  }))
  .actions(self => ({
    afterCreate() {
      if (self.nested) {
        self.setFolding(self.tableType);
      }
    },
    setTotal(total) {
      self.total = total;
    },
    setPageSize(pageSize) {
      self.pageSize = pageSize;
    },
    setFolding(mode) {
      self.tableType = mode;
      switch (mode) {
        case 'unfolded': {
          self.nested.paginate = false;
          break;
        }
        case 'folded': {
          self.nested.paginate = true;
          break;
        }
        default:
          message.error('Неподдерживаемый режим отображения');
      }
    },
  }));

export default TableSettings;
