import { reaction, toJS } from 'mobx';
import { types, getRoot, getParent } from 'mobx-state-tree';
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
  }))
  .actions(self => ({
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
    createPage(related, parent) {
      self.state = 'pending';
      const query = {
        url: self.url,
        title: self.title,
        clientID: self.client.id,
        type: self.type,
      };
      if (related) {
        query.parent = getParent(self).id;
      }
      axios().post('v1/page', query).then(
        () => self.createPageSuccess(related, parent),
        self.createPageError,
      );
    },
    createPageSuccess(related, parent) {
      self.client.fetchPages();
      self.setURL('');
      self.state = 'done';
    },
    createPageError() {
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
      return self.pages.values().filter(page => page.parent === self.id);
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
        () => self.clientStore.startDate,
        () => self.fetchPages(),
      );
      reaction(
        () => self.clientStore.endDate,
        () => self.fetchPages(),
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
      for (let i = 0; i < data.length; i += 1) {
        data[i].id = data[i]._id;
        self.pages.put(data[i]);
      }
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
      self.setName('');
      self.toggleModal();
      self.state = 'done';
    },
    createClientError() {
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
    fetchClients() {
      self.state = 'pending';
      axios().get('v1/client', {
        params: {
          filter: '',
        },
      }).then(
        self.fetchClientsSuccess,
        self.fetchClientsError,
      );
    },
    fetchClientsSuccess({ data }) {
      self.clients.replace(data.map(item => ({
        ...item,
        id: item._id
      })));
      self.state = 'done';
    },
    fetchClientsError(error) {
      self.state = 'error';
    },
  }));

const clientStore = ClientStore.create({});

export default clientStore;
