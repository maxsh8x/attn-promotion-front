import { toJS, reaction } from 'mobx';
import { types, getRoot } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

const Input = types
  .model('Input', {
    cost: 0,
    clicks: 0,
  });

const Metric = types
  .model('Metrics', {
    metric: types.string,
    sources: types.map(types.number),
    metagroups: types.map(types.number),
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
    commitInputState: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    metrics: types.optional(
      types.array(Metric),
      [],
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
        result.cost += input.cost;
        result.clicks += input.clicks;
      });
      if (result.cost && result.clicks) {
        result.costPerClick = (result.cost / result.clicks).toFixed(2);
      }
      return result;
    },
    get store() {
      return getRoot(self);
    },
    get inputData() {
      return [{
        ...self.inputs.toJSON(),
        id: self.id,
      }];
    },
    get metricsData() {
      return toJS(self.metrics);
    },
  }))
  .actions(self => ({
    commitInput(network, type, value) {
      self.inputs.get(network)[type] = parseFloat(value, 10);
      return axios().post('v1/input', {
        yDate: self.store.date,
        source: network,
        pageID: self.id,
        value: parseFloat(value, 10),
        type,
      }).then(
        self.commitInputSuccess,
        self.commitInputError,
      );
    },
    commitInputSuccess() {
      message.info('Изменения сохранены');
      self.commitInputState = 'done';
    },
    commitInputError() {
      message.info('Ошибка при сохранении изменений');
      self.commitInputState = 'error';
    },
    updateStatus(checked) {
      return axios().patch(`v1/page/${self.id}/status`, {
        active: checked,
      }).then(
        () => self.updateStatusSuccess(checked),
        self.updateStatusFailed,
      );
    },
    updateStatusSuccess(checked) {
      self.active = checked;
    },
    updateStatusFailed() { },
    fetchMetrics() {
      return axios().get(
        'v1/metrics',
        {
          params: {
            yDate: self.store.date,
            pageID: self.id,
          },
        },
      ).then(
        self.fetchMetricsSuccess,
        self.fetchMetricsError,
      );
    },
    fetchMetricsSuccess({ data }) {
      self.metrics.replace(data);
    },
    fetchMetricsError() { },
  }));

const PromotionStore = types
  .model('PromotionStore', {
    date: types.optional(
      types.string,
      moment().subtract(1, 'days').format('YYYY-MM-DD'),
    ),
    activePages: 0,
    inactivePages: 0,
    sources: types.optional(
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
    limit: 10,
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [self.date, self.offset, self.limit],
        () => self.fetchPages(),
      );
    },
    setPagination(current, pageSize) {
      const offset = (current - 1) * pageSize;
      self.offset = offset;
      self.limit = pageSize;
    },
    setDate(date, dateString) {
      self.date = dateString;
    },
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
      const networksInitState = {};
      for (let i = 0; i < data.sources.length; i += 1) {
        networksInitState[data.sources[i]] = {
          cost: 0,
          clicks: 0,
        };
      }

      const flatInput = {};
      for (let i = 0; i < data.input.length; i += 1) {
        flatInput[data.input[i]._id.page] = { ...networksInitState };
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
        inputs: flatInput[item._id]
          ? { ...networksInitState, ...flatInput[item._id] }
          : networksInitState,
      })));
      self.sources.replace(data.sources);
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
