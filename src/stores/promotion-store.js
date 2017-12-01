import { toJS, reaction } from 'mobx';
import { types, getRoot, getParent, addDisposer } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { getInitState, getFlatInputs, mergeInputs } from '../utils/inputs';
import { fetchStates } from '../constants';
import TableSettings from './table-settings';
import Filter from './filter-store';


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

const MetricsWidgetDay = types
  .model('MetricsWidgetDay', {
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
    metrics: types.optional(
      types.array(Metric),
      [],
    ),
    startDate: types.optional(
      types.string,
      moment().add(-1, 'months').format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().add(-1, 'days').format('YYYY-MM-DD'),
    ),
    popoverShown: false,
  })
  .views(self => ({
    get metricsData() {
      return toJS(self.metrics);
    },
    get page() {
      return getParent(self);
    },
    get store() {
      return getRoot(self);
    },
    get totalClickCost() {
      const { cost } = self.page.total;
      const pageViews = self.metrics.find(item => item.metric === 'pageviews');
      if (cost && pageViews && pageViews.metagroups.get('total')) {
        return (cost / pageViews.metagroups.get('total')).toFixed(2);
      }
      return 0;
    },
  }))
  .actions(self => ({
    togglePopover() {
      self.popoverShown = !self.popoverShown;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchMetrics() {
      self.state = 'pending';
      axios().get(
        'v1/metrics/day',
        {
          params: {
            yDate: self.store.date,
            pageID: self.page.id,
          },
        },
      ).then(
        self.fetchMetricsSuccess,
        self.fetchMetricsError,
      );
    },
    fetchMetricsSuccess({ data }) {
      self.state = 'done';
      self.metrics.replace(data);
    },
    fetchMetricsError() {
      message.error('Ошибка при получении метрик за день');
      self.state = 'error';
    },
    updateMetrics() {
      self.state = 'pending';
      axios().post('/v1/metrics', {
        startDate: self.startDate,
        endDate: self.endDate,
        pageID: self.page.id,
      }).then(
        self.updateMetricsSucess,
        self.updateMetricsError,
      );
    },
    updateMetricsSucess() {
      message.info('Данные метрик обновлены');
      self.fetchMetrics();
      self.state = 'done';
    },
    updateMetricsError() {
      message.error('Ошибка при обновлении метрик');
      self.state = 'error';
    },
  }));

const MetricsWidgetPeriod = types
  .model('MetricsWidgetPeriod', {
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
    metrics: types.optional(
      types.array(Metric),
      [],
    ),
  })
  .views(self => ({
    get metricsData() {
      return toJS(self.metrics);
    },
    get page() {
      return getParent(self);
    },
    get store() {
      return getRoot(self);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => [
          self.store.metricsPeriodSelector.startDate,
          self.store.metricsPeriodSelector.endDate,
        ],
        () => self.fetchMetrics(),
      );
      addDisposer(self, disposer1);
    },
    fetchMetrics() {
      self.state = 'pending';
      axios().get(
        'v1/metrics/period',
        {
          params: {
            startDate: self.store.metricsPeriodSelector.startDate,
            endDate: self.store.metricsPeriodSelector.endDate,
            pageID: self.page.id,
          },
        },
      ).then(
        self.fetchMetricsSuccess,
        self.fetchMetricsError,
      );
    },
    fetchMetricsSuccess({ data }) {
      self.state = 'done';
      self.metrics.replace(data);
    },
    fetchMetricsError() {
      message.error('Ошибка при получении метрик за период');
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
    inputsDay: types.optional(
      types.map(Input),
      {},
    ),
    inputsPeriod: types.optional(
      types.map(Input),
      {},
    ),
    commitInputState: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    metricsWidgetDay: types.optional(MetricsWidgetDay, {}),
    metricsWidgetPeriod: types.optional(MetricsWidgetPeriod, {}),
    fetchClientsNamesState: types.optional(
      types.enumeration(fetchStates),
      'pending',
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
      const resultItem = {
        cost: 0,
        clicks: 0,
        costPerClick: 0,
      };
      const result = {
        day: { ...resultItem },
        period: { ...resultItem },
      };
      // TODO: refactor
      self.inputsDay.forEach((input) => {
        result.day.cost += input.cost;
        result.day.clicks += input.clicks;
      });
      if (result.day.cost && result.day.clicks) {
        result.day.costPerClick = (result.day.cost / result.day.clicks).toFixed(2);
      }
      self.inputsPeriod.forEach((input) => {
        result.period.cost += input.cost;
        result.period.clicks += input.clicks;
      });
      if (result.period.cost && result.period.clicks) {
        result.period.costPerClick = (result.period.cost / result.period.clicks).toFixed(2);
      }
      return result;
    },
    get store() {
      return getRoot(self);
    },
    get inputDataDay() {
      return [{
        ...self.inputsDay.toJSON(),
        id: self.id,
      }];
    },
  }))
  .actions(self => ({
    setInput(network, type, value) {
      const parsedValue = parseFloat(value, 10);
      if (!(isNaN(parsedValue))) {
        self.inputsDay.get(network)[type] = parsedValue;
      }
    },
    fetchPeriodInputs() {
      axios().get('/v1/input', {
        params: {
          pageID: self.id,
          startDate: self.store.metricsPeriodSelector.startDate,
          endDate: self.store.metricsPeriodSelector.endDate,
        },
      }).then(
        self.fetchPeriodInputsSuccess,
        self.fetchPeriodInputsError,
      );
    },
    fetchPeriodInputsSuccess({ data }) {
      const networksInitState = getInitState(self.store.sources);
      const flatInputPeriod = getFlatInputs(data, networksInitState);
      self.inputsPeriod = mergeInputs(
        flatInputPeriod,
        networksInitState,
        self.id,
      );
    },
    fetchPeriodInputsError() {
      message.error('Не удалось получить общее за период');
    },
    commitInput(network, type, value) {
      self.inputsDay.get(network)[type] = parseFloat(value, 10);
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
      self.fetchPeriodInputs();
      self.commitInputState = 'done';
    },
    commitInputError() {
      message.error('Ошибка при сохранении изменений');
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
  }));

const MetricsPeriodSelector = types
  .model('MetricsPeriodSelector', {
    startDate: types.optional(
      types.string,
      moment().add(-1, 'months').format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().add(-1, 'days').format('YYYY-MM-DD'),
    ),

  })
  .actions(self => ({
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
  }));

const PromotionStore = types
  .model('PromotionStore', {
    metricsPeriodSelector: types.optional(MetricsPeriodSelector, {}),
    tabSettings: types.map(TableSettings),
    activeTab: types.optional(
      types.enumeration(['active', 'inactive']),
      'active',
    ),
    filter: types.optional(Filter, {
      length: 10,
      url: '/v1/client/search',
    }),
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
          self.metricsPeriodSelector.startDate,
          self.metricsPeriodSelector.endDate,
        ],
        () => self.fetchPages(true),
      );
      const disposer3 = reaction(
        () => self.pageFilter,
        () => self.fetchPages(),
        { delay: 1000 },
      );
      const disposer4 = reaction(
        () => self.filter.itemsData,
        () => self.setClientsFilter(self.filter.itemsData.map(client => client.key)),
      );
      addDisposer(self, disposer1);
      addDisposer(self, disposer2);
      addDisposer(self, disposer3);
      addDisposer(self, disposer4);
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
          startDate: self.metricsPeriodSelector.startDate,
          endDate: self.metricsPeriodSelector.endDate,
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
    fetchPagesSuccess({
      sources,
      inputDay,
      inputPeriod,
      pages,
      activePages,
      inactivePages,
    }, onlyInputs) {
      const networksInitState = getInitState(sources);

      const flatInputDay = getFlatInputs(inputDay, networksInitState);
      const flatInputPeriod = getFlatInputs(inputPeriod, networksInitState);

      if (onlyInputs) {
        for (let i = 0; i < self.pages.length; i += 1) {
          self.pages[i].inputsDay.clear();
          self.pages[i].inputsDay = mergeInputs(
            flatInputDay,
            networksInitState,
            self.pages[i].id,
          );
          self.pages[i].inputsPeriod.clear();
          self.pages[i].inputsPeriod = mergeInputs(
            flatInputPeriod,
            networksInitState,
            self.pages[i].id,
          );
        }
      } else {
        self.pages.replace(pages.map(item => ({
          ...item,
          id: item._id,
          inputsDay: mergeInputs(
            flatInputDay,
            networksInitState,
            item._id,
          ),
          inputsPeriod: mergeInputs(
            flatInputPeriod,
            networksInitState,
            item._id,
          ),
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
