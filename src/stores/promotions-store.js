import { types } from 'mobx-state-tree';
import moment from 'moment';

const Metric = types
  .model('Metric', {
    id: types.identifier(),
  });

const Page = types
  .model('Page', {
    metrics: types.map(Metric, {}),
  });

const PagesTable = types
  .model('PagesTable', {
    pages: types.optional(
      types.map(Page),
      {},
    ),
    count: 0,
  });

const PromotionStore = types
  .model('PromotionStore', {
    date: types.optional(
      types.string,
      moment().subtract(1, 'days').format('YYYY-MM-DD'),
    ),
    clientName: types.optional(
      types.string,
      '',
    ),
    pageName: types.optional(
      types.string,
      '',
    ),
    tabs: types.optional(types.map(PagesTable), {}),
  });

const promotionStore = PromotionStore.create({
  tabs: {
    active: PagesTable.create({ id: 'active' }),
    inactive: PagesTable.create({ id: 'inactive' }),
  },
});

export default promotionStore;
