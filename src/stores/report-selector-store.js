import { reaction, toJS } from 'mobx';
import { types, addDisposer, getParent, getRoot } from 'mobx-state-tree';
import axios from '../utils/axios';
import { fetchStates } from '../constants';
import Filter from './filter-store';


const PageSelectorItem = types
  .model('PageSelectorItem', {
    id: types.identifier(types.number),
    title: types.string,
  });

const CampaignSelectorItem = types
  .model('CampaignSelectorItem', {
    startDate: types.string,
    endDate: types.string,
  });

const CampaignsSelector = types
  .model('CampaignsSelector', {
    index: types.maybe(types.number),
    campaigns: types.optional(types.array(CampaignSelectorItem), []),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get pageSelector() {
      return getParent(self);
    },
    get selectedCampaign() {
      return self.index !== null
        ? self.campaigns[self.index]
        : null;
    },
    get newestIsActive() {
      return self.index !== null && self.index !== 0;
    },
    get oldestIsActive() {
      return self.index !== null && self.index + 1 !== self.campaigns.length;
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => self.pageSelector.pageID,
        () => {
          self.fetchCampaigns();
        },
      );
      addDisposer(self, disposer1);
    },
    oldest() {
      self.index += 1;
    },
    newest() {
      self.index -= 1;
    },
    reset() {
      self.index = null;
      self.campaigns.clear();
    },
    fetchCampaigns() {
      self.state = 'pending';
      const clientID = self.pageSelector.clientSelector.clientID;
      const pageID = self.pageSelector.pageID;
      if (clientID && pageID) {
        axios().get(`v1/page/${pageID}/report/${clientID}`,
        ).then(
          self.fetchCampaignsSuccess,
          self.fetchCampaignsError,
        );
      }
    },
    fetchCampaignsSuccess({ data }) {
      self.index = data.length > 0 ? 0 : null;
      self.campaigns.replace(data);
      self.state = 'done';
    },
    fetchCampaignsError() {
      self.state = 'error';
    },
  }));

const PageSelector = types
  .model('PageSelector', {
    pageID: types.maybe(types.number),
    pages: types.optional(types.array(PageSelectorItem), []),
    campaignSelector: types.optional(CampaignsSelector, {}),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get clientSelector() {
      return getParent(self);
    },
    get pagesData() {
      return toJS(self.pages);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => self.clientSelector.clientID,
        () => {
          if (self.clientSelector.clientID) {
            self.fetchPages();
          }
        },
      );
      addDisposer(self, disposer1);
    },
    setPage(pageID) {
      self.pageID = parseInt(pageID, 10);
    },
    reset() {
      self.pageID = null;
      self.pages.clear();
    },
    fetchPages() {
      self.state = 'pending';
      const clientID = self.clientSelector.clientID;
      axios().get(`v1/client/pages/${clientID}/`,
      ).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      self.pages.replace(data);
      self.state = 'done';
    },
    fetchPagesError() {
      self.state = 'error';
    },
  }));

const ClientSelector = types
  .model('ClientSelector', {
    clientID: types.maybe(types.number),
    pageSelector: types.optional(PageSelector, {}),
    filter: types.optional(Filter, {
      length: 1,
      url: '/v1/client/search',
    }),
  })
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => self.filter.itemsData,
        () => {
          self.setClient(self.filter.itemsData);
        },
      );
      addDisposer(self, disposer1);
    },
    setClient(items) {
      self.clientID = items.length > 0
        ? parseInt(items[0].key, 10)
        : null;
      self.pageSelector.reset();
      self.pageSelector.campaignSelector.reset();
    },
  }));

const ReportSelectorStore = types
  .model('ReportSelectorStore', {
    clientSelector: types.optional(ClientSelector, {}),
  })
  .views(self => ({
    get result() {
      const { selectedCampaign } = self.clientSelector.pageSelector.campaignSelector;
      const startDate = selectedCampaign ? selectedCampaign.startDate : null;
      const endDate = selectedCampaign ? selectedCampaign.endDate : null;
      return {
        clientID: self.clientSelector.clientID,
        pageID: self.clientSelector.pageSelector.pageID,
        startDate,
        endDate,
      };
    },
  }));

const reportSelectorStore = ReportSelectorStore.create({});

export default reportSelectorStore;
