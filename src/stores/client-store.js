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
    type: types.enumeration(['individual', 'related']),
  })
  .views(self => ({
    get client() {
      return (self.type === 'related')
        ? getParent(self, 3)
        : getParent(self);
    },
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
    create(related, parent) {
      self.state = 'pending';
      const query = {
        url: self.url,
        title: self.title,
        client: self.client.id,
        type: self.type,
        minViews: self.minViews,
        maxViews: self.maxViews,
        costPerClick: self.costPerClick,
        startDate: self.startDate,
        endDate: self.endDate,
      };
      if (related) {
        query.parent = getParent(self).id;
      }
      axios().post('v1/page', query).then(
        () => self.createSuccess(related, parent),
        self.createError,
      );
    },
    createSuccess() {
      self.toggleModal();
      self.client.fetchPages();
      self.store.fetchData(true);
      self.state = 'done';
    },
    createError() {
      self.state = 'error';
    },
    toggleModal() {
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
    views: 0, // null
    pageCreator: types.optional(PageMetaCreator, { type: 'related' }),
  })
  .views(self => ({
    get pages() {
      return getParent(self);
    },
    get client() {
      return getParent(self, 2);
    },
    get pagesData() {
      return toJS(self.pages).filter(page => page.type === 'related');
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    counterID: types.number,
    name: types.string,
    brand: types.string,
    vatin: types.string,
    views: 0,
    costPerClick: 0,
    pages: types.optional(types.array(Page), []),
    fetchPagesState: types.optional(types.enumeration(fetchStates), 'pending'),
    pageCreator: types.optional(PageMetaCreator, { type: 'individual' }),
    current: 1,
    pageSize: 10,
    total: 0,
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages).filter(page => page.type !== 'related');
    },
    get clientStore() {
      return getRoot(self);
    },
    findPageById(id) {
      return self.pages.find(page => page.id === id);
    },
  }))
  .actions(self => ({
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    fetchPages() {
      self.fetchPagesState = 'pending';
      axios().get('v1/page/client', {
        params: {
          clientID: self.id,
          offset: (self.current - 1) * self.pageSize,
          limit: self.pageSize,
          startDate: self.clientStore.startDate,
          endDate: self.clientStore.endDate,
        },
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      self.pages.replace(data.pagesData.map(page => ({
        ...page,
        id: page._id,
        ...page.meta[0],
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
      self.store.fetchClients();
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
    tabSettings: types.map(TableSettings),
    clients: types.optional(types.array(Client), []),
    clientCreator: types.optional(ClientCreator, {}),
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
    pageSize: 10,
    total: 0,
  })
  .views(self => ({
    get clientsData() {
      return toJS(self.clients);
    },
    findClientById(id) {
      return self.clients.find(client => client.id === id);
    },
  }))
  .actions(self => ({
    afterCreate() {
      const disposer1 = reaction(
        () => [
          self.current,
          self.pageSize,
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
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchData(onlyMeta = false) {
      self.state = 'pending';
      axios().get('v1/client', {
        params: {
          filter: '',
          offset: (self.current - 1) * self.pageSize,
          limit: self.pageSize,
          startDate: self.startDate,
          endDate: self.endDate,
        },
      }).then(
        ({ data }) => self.fetchDataSuccess(data, onlyMeta),
        self.fetchDataError,
      );
    },
    fetchDataSuccess({ clientsData, views, costPerClick, total }, onlyMeta) {
      self.total = total;
      if (onlyMeta) {
        self.clients.forEach((client) => {
          client.views = views[client.id] || 0;
          client.costPerClick = costPerClick[client.id] || 0;
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
    group: {
      nested: {},
      columns,
    },
    individual: {
      nested: {},
      columns,
    },
  },
});

export default clientStore;
