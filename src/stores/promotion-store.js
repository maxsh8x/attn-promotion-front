import { toJS } from 'mobx';
import { types } from 'mobx-state-tree';
import moment from 'moment';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

const Input = types
  .model('Input', {
    cost: 0,
    clicks: 0,
  });

const Page = types
  .model('Page', {
    id: types.identifier(types.number),
    createdAt: types.string,
    url: types.string,
    type: types.string,
    active: types.boolean,
    inputs: types.optional(
      types.map(Input),
      {},
    ),
  })
  .views(self => ({
    get total() {
      const result = {
        cost: 0,
        clicks: 0,
        costPerClick: 0,
      };
      self.inputs.forEach((input) => {
        result.cost = input.cost;
        result.clicks = input.clicks;
      });
      if (result.cost && result.clicks) {
        result.costPerClick = (result.cost / result.clicks).toFixed(2);
      }
      return result;
    },
  }));

const PromotionStore = types
  .model('PromotionStore', {
    date: types.optional(
      types.string,
      moment().subtract(1, 'days').format('YYYY-MM-DD'),
    ),
    activePages: 0,
    inactivePages: 0,
    metricNetworks: types.optional(
      types.array(types.string),
      [],
    ),
    pages: types.optional(
      types.array(Page),
      [],
    ),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    isActiveTab: true,
    offset: 0,
    limit: 50,
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
  }))
  .actions(self => ({
    switchTab(tabKey) {
      self.isActiveTab = tabKey === 'active';
      self.fetchPages();
    },
    fetchPages() {
      self.fetchPagesState = 'pending';
      axios().get('v1/page', {
        params: {
          yDate: self.date,
          active: self.isActiveTab,
          offset: self.offset,
          limit: self.limit,
          clients: '',
          filter: '',
        },
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      const flatInput = {};

      for (let i = 0; i < data.input.length; i += 1) {
        flatInput[data.input[i]._id.page] = {};
        for (let x = 0; x < data.input[i].sources.length; x += 1) {
          flatInput[data.input[i]._id.page][data.input[i].sources[x]] = {
            cost: data.input[i].cost[x],
            clicks: data.input[i].clicks[x],
          };
        }
      }

      self.pages.replace(data.pages.map(item => ({
        ...item,
        id: item._id,
        inputs: flatInput[item._id],
      })));
      self.metricNetworks.replace(data.metricNetworks);
      self.activePages = data.activePages;
      self.inactivePages = data.inactivePages;
      self.fetchPagesState = 'done';
    },
    fetchPagesError() {
      self.fetchPagesState = 'error';
    },
  }));

const promotionStore = PromotionStore.create({});

export default promotionStore;
