import { reaction, toJS } from 'mobx';
import { types, addDisposer, getParent } from 'mobx-state-tree';
import axios from '../utils/axios';
import { fetchStates } from '../constants';

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
    startDate: types.maybe(types.string),
    endDate: types.maybe(types.string),
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
    get campaignsData() {
      return toJS(self.campaigns);
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
    fetchCampaigns() {
      self.state = 'pending';
      const clientID = self.pageSelector.clientSelector.clientID;
      const pageID = self.pageSelector.pageID;
      axios().get(`v1/page/${clientID}/report/${pageID}`,
      ).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchCampaignsSuccess({ data }) {
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
          self.fetchPages();
        },
      );
      addDisposer(self, disposer1);
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
  })
  .actions(self => ({
    setClient(items) {
      self.clientID = items.length > 0
        ? parseInt(items[0].key, 10)
        : null;
    },
  }));

const reportSelectorStore = ClientSelector.create({});

export default reportSelectorStore;
