import { toJS, reaction } from 'mobx';
import { types, getRoot, getParent, addDisposer } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';
import TableSettings from './table-settings';

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
    clientsNames: types.optional(
      types.array(types.string),
      [],
    ),
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
      'pending',
    ),
    fetchClientsNamesState: types.optional(
      types.enumeration(fetchStates),
      'pending',
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
    get clientsNamesData() {
      return toJS(self.clientsNames);
    },
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
      if (cost && pageViews && pageViews.metagroups.get('total')) {
        return (cost / pageViews.metagroups.get('total')).toFixed(2);
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
      const parsedValue = parseFloat(value, 10);
      if (!(isNaN(parsedValue))) {
        self.inputs.get(network)[type] = parsedValue;
      }
    },
    commitInput(network, type, value) {
      self.inputs.get(network)[type] = parseFloat(value, 10);
      axios().post('v1/input', {
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
      axios().patch(`v1/page/${self.id}/status`, {
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
      axios().get(
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
      message.error('Ошибка при получении метрик');
      self.fetchMetricsState = 'error';
    },
    updateMetrics() {
      axios().post('/v1/metrics', {
        startDate: self.store.date,
        endDate: self.store.date,
        pageID: self.id,
      }).then(
        self.updateMetricsSucess,
        self.updateMetricsError,
      );
    },
    fetchClientsNames() {
      self.fetchClientsNamesState = 'pending';
      return axios().get('/v1/page/clientsList', {
        params: { pageID: self.id },
      }).then(
        self.fetchClientsNamesSuccess,
        self.fetchClientsNamesError,
      );
    },
    fetchClientsNamesSuccess({ data }) {
      self.clientsNames.replace(data);
      self.fetchClientsNamesState = 'done';
    },
    fetchClientsNamesError() {
      message.error('Ошибка при получении имен клиентов');
      self.fetchClientsNamesState = 'error';
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
    tabSettings: types.map(TableSettings),
    activeTab: types.optional(
      types.enumeration(['active', 'inactive']),
      'active',
    ),
    date: types.optional(
      types.string,
      moment().subtract(1, 'days').format('YYYY-MM-DD'),
    ),
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
    clientsFilter: '',
    pageFilter: '',
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
    get settings() {
      return self.tabSettings.get(self.activeTab);
    },
    get activeTabSettings() {
      return self.tabSettings.get('active');
    },
    get inactiveTabSettings() {
      return self.tabSettings.get('inactive');
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => [
          self.settings.current,
          self.settings.pageSize,
          self.clientsFilter,
        ],
        () => self.fetchPages(),
      );
      const disposer2 = reaction(
        () => [
          self.date,
        ],
        () => self.fetchPages(true),
      );
      const disposer3 = reaction(
        () => self.pageFilter,
        () => self.fetchPages(),
        { delay: 1000 },
      );
      addDisposer(self, disposer1);
      addDisposer(self, disposer2);
      addDisposer(self, disposer3);
    },
    setClientsFilter(clients) {
      self.clientsFilter = clients.join(',');
    },
    setPageFilter(value) {
      self.pageFilter = value;
    },
    setDate(date, dateString) {
      self.date = dateString;
    },
    switchTab(tabKey) {
      self.activeTab = tabKey;
      self.fetchPages();
    },
    fetchPages(onlyInputs = false) {
      self.state = 'pending';
      axios().get('v1/page', {
        params: {
          yDate: self.date,
          active: self.activeTab === 'active',
          offset: (self.settings.current - 1) * self.settings.pageSize,
          limit: self.settings.pageSize,
          clients: self.clientsFilter,
          filter: self.pageFilter,
        },
      }).then(
        ({ data }) => self.fetchPagesSuccess(data, onlyInputs),
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ sources, input, pages, activePages, inactivePages }, onlyInputs) {
      const networksInitState = {};
      for (let i = 0; i < sources.length; i += 1) {
        networksInitState[sources[i]] = {
          cost: 0,
          clicks: 0,
        };
      }

      const flatInput = {};
      for (let i = 0; i < input.length; i += 1) {
        flatInput[input[i]._id.page] = { ...networksInitState };
        for (let x = 0; x < input[i].sources.length; x += 1) {
          flatInput[input[i]._id.page][input[i].sources[x]] = {
            cost: input[i].cost[x],
            clicks: input[i].clicks[x],
          };
        }
      }
      if (onlyInputs) {
        for (let i = 0; i < self.pages.length; i += 1) {
          self.pages[i].inputs.clear();
          self.pages[i].inputs = flatInput[self.pages[i].id]
            ? { ...networksInitState, ...flatInput[self.pages[i].id] }
            : networksInitState;
        }
      } else {
        self.pages.replace(pages.map(item => ({
          ...item,
          id: item._id,
          inputs: flatInput[item._id]
            ? { ...networksInitState, ...flatInput[item._id] }
            : networksInitState,
        })));
      }
      self.sources.replace(sources);
      self.activeTabSettings.setTotal(activePages);
      self.inactiveTabSettings.setTotal(inactivePages);
      self.state = 'done';
    },
    fetchPagesError() {
      message.error('Ошибка при получении страниц');
      self.state = 'error';
    },
  }));

const promotionStore = PromotionStore.create({
  tabSettings: {
    active: {},
    inactive: {},
  },
});

export default promotionStore;
