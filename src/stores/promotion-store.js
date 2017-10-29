import { toJS, reaction } from 'mobx';
import { types, getRoot, getParent } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import debounce from 'lodash.debounce';
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

const ChartItem = types
  .model({
    x: types.string,
    y: types.number,
  });

const PromotionChart = types
  .model('PromotionChart', {
    items: types.optional(
      types.array(ChartItem),
      [],
    ),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    interval: types.optional(
      types.enumeration(['days', 'months']),
      'days',
    ),
    startDate: types.optional(
      types.string,
      moment().subtract(1, 'month').format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().format('YYYY-MM-DD'),
    ),
  })
  .views(self => ({
    get page() {
      return getParent(self);
    },
    get chartData() {
      return toJS(self.items);
    },
    get store() {
      return getRoot(self);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.startDate,
          self.endDate,
          self.interval,
        ],
        () => self.fetchChart(),
      );
    },
    setInterval(value) {
      self.interval = value;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchChart() {
      self.state = 'pending';
      axios().get('v1/metrics/promotionChart', {
        params: {
          startDate: self.startDate,
          endDate: self.endDate,
          interval: self.interval,
          pageID: self.page.id,
        },
      }).then(
        self.fetchChartSuccess,
        self.fetchChartError,
      );
    },
    fetchChartSuccess({ data }) {
      self.state = 'done';
      self.items.replace(data);
    },
    fetchChartError() {
      self.state = 'error';
    },
  }));

const Page = types
  .model('Page', {
    id: types.identifier(types.number),
    createdAt: types.string,
    url: types.string,
    title: types.string,
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
    fetchMetricsState: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    metrics: types.optional(
      types.array(Metric),
      [],
    ),
    chart: types.optional(
      PromotionChart,
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
        result.cost += input.cost;
        result.clicks += input.clicks;
      });
      if (result.cost && result.clicks) {
        result.costPerClick = (result.cost / result.clicks).toFixed(2);
      }
      return result;
    },
    get totalClickCost() {
      const { cost } = self.total;
      const pageViews = self.metrics.find(item => item.metric === 'pageviews');
      if (cost && pageViews && pageViews.metagroups.get('ad')) {
        return (cost / pageViews.metagroups.get('ad')).toFixed(2);
      }
      return 0;
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
    setInput(network, type, value) {
      self.inputs.get(network)[type] = value;
    },
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
      self.fetchMetricsState = 'pending';
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
      self.fetchMetricsState = 'done';
      self.metrics.replace(data);
    },
    fetchMetricsError() {
      self.fetchMetricsState = 'error';
    },
    updateMetrics() {
      return axios().post('/v1/metrics', {
        yDate: self.store.date,
        pageID: self.id,
      }).then(
        self.updateMetricsSucess,
        self.updateMetricsError,
      );
    },
    updateMetricsSucess() {
      self.fetchMetrics();
    },
    updateMetricsError() {
      message.error('Ошибка при обновлении метрик');
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
    current: 1,
    pageSize: 10,
    clientsFilter: '',
    pageFilter: '',
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.current,
          self.pageSize,
          self.clientsFilter,
        ],
        () => self.fetchPages(),
      );
      reaction(
        () => self.date,
        () => self.fetchPages(),
      );
      reaction(
        () => self.pageFilter,
        () => self.fetchPages(),
        { delay: 1000 },
      );
    },
    setClientsFilter(clients) {
      self.clientsFilter = clients.join(',');
    },
    setPageFilter(value) {
      self.pageFilter = value;
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    setDate(date, dateString) {
      self.date = dateString;
    },
    switchTab(tabKey) {
      self.isActiveTab = tabKey === 'active';
      self.fetchPages();
    },
    fetchPages() {
      self.state = 'pending';
      axios().get('v1/page', {
        params: {
          yDate: self.date,
          active: self.isActiveTab,
          offset: (self.current - 1) * self.pageSize,
          limit: self.pageSize,
          clients: self.clientsFilter,
          filter: self.pageFilter,
        },
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }, onlyMetrics = false) {
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
      self.state = 'done';
    },
    fetchPagesError() {
      self.state = 'error';
    },
  }));

const promotionStore = PromotionStore.create({});

export default promotionStore;
