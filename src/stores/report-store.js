import { reaction, toJS } from 'mobx';
import { types, addDisposer } from 'mobx-state-tree';

const PageSelectorItem = types
  .model('PageSelectorItem', {
    id: types.identifier(types.number),
    title: types.string(),
  });

const CampaignSelectorItem = types
  .model('CampaignSelectorItem', {
    startDate: types.string,
    endDate: types.string,
  });

const ReportSelector = types
  .model('ReportSelector', {
    clientID: types.maybe(types.number),
    pageID: types.maybe(types.number),
    pages: types.optional(types.array(PageSelectorItem), []),
    campaigns: types.optional(types.array(CampaignSelectorItem), []),
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => self.clientID,
        () => [
          self.fetchData(true),
        ],
      );
      addDisposer(self, disposer1);
    },
    setClient(items) {
      self.clientID = items.length > 0
        ? parseInt(items[0].key, 10)
        : null;
    },
  }));

const ReportStore = types
  .model('ReportStore', {
    reportSelector: types.optional(ReportSelector, {}),
  })
  .views(self => ({}))
  .actions(self => ({}));

const reportStore = ReportStore.create({});

export default reportStore;
