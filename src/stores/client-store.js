import { reaction, toJS } from 'mobx';
import { types, getRoot, getParent, addDisposer } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';
import TableSettings from './table-settings';

const PageMetaCreator = types
  .model('PageMetaCreator', {
    modalShown: false,
    modalClientID: types.maybe(types.number),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    url: '',
    title: '',
    minViews: 0,
    maxViews: 0,
    costPerClick: 0,
    startDate: types.optional(
      types.string,
      moment().format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().add(1, 'months').format('YYYY-MM-DD'),
    ),
    type: types.enumeration(['individual']),
  })
  .views(self => ({
    get store() {
      return getRoot(self);
    },
  }))
  .actions(self => ({
    setMinViews(value) {
      self.minViews = value;
    },
    setMaxViews(value) {
      self.maxViews = value;
    },
    setCostPerClick(value) {
      self.costPerClick = value;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    setURL(value) {
      self.url = value;
    },
    setType(value) {
      self.type = value;
    },
    create() {
      self.state = 'pending';
      const query = {
        url: self.url,
        title: self.title,
        client: self.modalClientID,
        type: self.type,
        minViews: self.minViews,
        maxViews: self.maxViews,
        costPerClick: self.costPerClick,
        startDate: self.startDate,
        endDate: self.endDate,
      };
      axios().post('v1/page', query).then(
        () => self.createSuccess(self.modalClientID),
        self.createError,
      );
    },
    createSuccess(modalClientID) {
      self.toggleModal();
      self.store.findClient(modalClientID).fetchPages();
      self.store.fetchData(true);
      message.info('Страница успешно создана');
      self.state = 'done';
    },
    createError() {
      message.error('Ошибка при создании страницы');
      self.state = 'error';
    },
    toggleModal(modalClientID = null) {
      if (modalClientID) {
        self.modalClientID = modalClientID;
      }
      self.modalShown = !self.modalShown;
    },
  }));

const Page = types
  .model('Page', {
    id: types.identifier(types.number),
    url: types.string,
    title: types.string,
    type: types.string,
    minViews: types.number,
    maxViews: types.number,
    costPerClick: types.number,
    startDate: types.string,
    endDate: types.string,
    parent: types.maybe(types.number),
    active: types.boolean,
    views: types.number,
    viewsPeriod: types.number,
  })
  .views(self => ({
    get pages() {
      return getParent(self);
    },
    get client() {
      return getParent(self, 2);
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    counterID: types.number,
    name: types.string,
    brand: types.string,
    vatin: types.string,
    views: types.number,
    cost: types.number,
    pages: types.optional(types.array(Page), []),
    fetchPagesState: types.optional(types.enumeration(fetchStates), 'pending'),
    current: 1,
    total: 0,
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages);
    },
    get clientStore() {
      return getRoot(self);
    },
    get settings() {
      return getRoot(self).settings.nested;
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer = reaction(
        () => [
          self.current,
          self.settings.pageSize,
          self.settings.paginate,
        ],
        () => self.fetchPages(),
      );
      addDisposer(self, disposer);
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.settings.setPageSize(pageSize);
    },
    fetchPages() {
      self.fetchPagesState = 'pending';
      const params = {
        clientID: self.id,
        startDate: self.clientStore.startDate,
        endDate: self.clientStore.endDate,
        type: self.clientStore.activeTab,
      };
      if (self.settings.paginate) {
        params.limit = self.settings.pageSize;
        params.offset = (self.current - 1) * self.settings.pageSize;
      }
      axios().get('v1/page/client', {
        params,
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      self.pages.replace(data.pagesData.map(page => ({
        ...page,
        id: page._id,
      })));
      self.total = data.total;
      self.fetchPagesState = 'done';
    },
    fetchPagesError() {
      message.error('Ошибка при получении страниц');
      self.fetchPagesState = 'error';
    },
  }));

const ClientCreator = types
  .model('ClientCreator', {
    name: '',
    brand: '',
    vatin: '',
    modalShown: false,
    counterID: types.maybe(types.number),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get store() {
      return getParent(self);
    },
  }))
  .actions(self => ({
    setName(value) {
      self.name = value;
    },
    setBrand(value) {
      self.brand = value;
    },
    setVATIN(value) {
      const reg = /^\d+$/;
      if (
        (!isNaN(value) && reg.test(value) && value.length <= 12)
        || value === ''
      ) {
        self.vatin = value;
      }
    },
    setCounterID(value) {
      const counterID = parseInt(value, 10);
      if (counterID) {
        self.counterID = counterID;
      } else if (value === '') {
        self.counterID = null;
      }
    },
    createClient() {
      self.state = 'pending';
      axios().post('v1/client', {
        name: self.name,
        brand: self.brand,
        vatin: self.vatin,
        counterID: self.counterID,
      }).then(
        self.createClientSuccess,
        self.createClientError,
      );
    },
    createClientSuccess() {
      self.toggleModal();
      self.store.fetchData();
      self.name = '';
      self.brand = '';
      self.vatin = '';
      self.counterID = null;
      self.state = 'done';
    },
    createClientError(error) {
      if (error.response.data.message === 'INVALID_COUNTER_ID') {
        message.error('Неверный ID счетчика');
      } else {
        message.error('Ошибка при создании клиента');
      }
      self.state = 'error';
    },
    toggleModal() {
      self.modalShown = !self.modalShown;
    },
  }));

const ClientStore = types
  .model('ClientStore', {
    activeTab: types.optional(
      types.enumeration(['all', 'group', 'individual']),
      'all',
    ),
    tabSettings: types.map(TableSettings),
    clients: types.optional(types.array(Client), []),
    clientCreator: types.optional(ClientCreator, {}),
    pageCreator: types.optional(PageMetaCreator, { type: 'individual' }),
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
    startDate: types.optional(
      types.string,
      moment().subtract(1, 'months').format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().format('YYYY-MM-DD'),
    ),
    current: 1,
    total: 0,
  })
  .views(self => ({
    get clientsData() {
      return toJS(self.clients);
    },
    findClient(id) {
      return self.clients.find(client => client.id === id);
    },
    get settings() {
      return self.tabSettings.get(self.activeTab);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => [
          self.settings.current,
          self.settings.pageSize,
        ],
        () => {
          self.fetchData();
        },
      );
      const disposer2 = reaction(
        () => [
          self.startDate,
          self.endDate,
        ],
        () => [
          self.fetchData(true),
        ],
      );
      addDisposer(self, disposer1);
      addDisposer(self, disposer2);
    },
    switchTab(tabKey) {
      self.activeTab = tabKey;
      self.fetchData();
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchData(onlyMeta = false) {
      self.state = 'pending';
      if (!(onlyMeta)) {
        self.clients.clear();
      }
      axios().get('v1/client', {
        params: {
          filter: '',
          offset: (self.settings.current - 1) * self.settings.pageSize,
          limit: self.settings.pageSize,
          startDate: self.startDate,
          endDate: self.endDate,
          type: self.activeTab,
        },
      }).then(
        ({ data }) => self.fetchDataSuccess(data, onlyMeta),
        self.fetchDataError,
      );
    },
    fetchDataSuccess({ clientsData, views, cost, total }, onlyMeta) {
      self.settings.total = total;
      if (onlyMeta) {
        self.clients.forEach((client) => {
          client.views = views[client.id] || 0;
          client.cost = cost[client.id] || 0;
        });
      } else {
        self.clients.replace(clientsData.map(item => ({
          ...item,
          id: item._id,
        })));
      }
      self.state = 'done';
    },
    fetchDataError(error) {
      message.error('Ошибка при получении клиентов');
      self.state = 'error';
    },
  }));

const columns = ['counterID', 'name', 'brand', 'vatin', 'views', 'costPerClick', 'actions'];

const clientStore = ClientStore.create({
  tabSettings: {
    all: {
      tableType: 'folded',
      nested: {},
      columns,
    },
    group: {
      tableType: 'folded',
      nested: {},
      columns,
    },
    individual: {
      tableType: 'folded',
      nested: {},
      columns,
    },
  },
});

export default clientStore;
