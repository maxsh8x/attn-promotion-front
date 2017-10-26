import { reaction, toJS } from 'mobx';
import { types, getRoot, getParent } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

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
      self.store.fetchClients(true);
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
    get totalViews() {
      return self.pagesData.length > 0
        ? self.pagesData.reduce((a, b) => a + b.views, 0)
        : 0;
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
    pages: types.optional(types.array(Page), []),
    fetchPagesState: types.optional(types.enumeration(fetchStates), 'pending'),
    pageCreator: types.optional(PageMetaCreator, { type: 'individual' }),
  })
  .views(self => ({
    get pagesData() {
      return toJS(self.pages).filter(page => page.type !== 'related');
    },
    get totalViews() {
      return self.pagesData.length > 0
        ? self.pagesData.reduce((a, b) => a + b.views, 0)
        : 0;
    },
    get clientStore() {
      return getRoot(self);
    },
    findPageById(id) {
      return self.pages.find(page => page.id === id);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.clientStore.startDate,
          self.clientStore.endDate,
        ],
        () => [
          self.fetchPages(),
          self.clientStore.fetchClients(true),
        ],
      );
    },
    fetchPages() {
      self.fetchPagesState = 'pending';
      axios().get('v1/page/client', {
        params: {
          clientID: self.id,
          startDate: self.clientStore.startDate,
          endDate: self.clientStore.endDate,
        },
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      self.pages.replace(data.map(page => ({ ...page, id: page._id })));
      self.fetchPagesState = 'done';
    },
    fetchPagesError() {
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
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchClients(onlyViews = false) {
      self.state = 'pending';
      axios().get('v1/client', {
        params: {
          filter: '',
          startDate: self.startDate,
          endDate: self.endDate,
        },
      }).then(
        ({ data }) => self.fetchClientsSuccess(data, onlyViews),
        self.fetchClientsError,
      );
    },
    fetchClientsSuccess({ clientsData, views }, onlyViews) {
      if (onlyViews) {
        self.clients.forEach((client) => {
          client.views = views[client.id] || 0;
        });
      } else {
        self.clients.replace(clientsData.map(item => ({
          ...item,
          id: item._id,
        })));
      }
      self.state = 'done';
    },
    fetchClientsError(error) {
      self.state = 'error';
    },
  }));

const clientStore = ClientStore.create({});

export default clientStore;
