import { reaction } from 'mobx';
import { types, getRoot, getParent, getPath } from 'mobx-state-tree';
import moment from 'moment';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

const Page = types
  .model('Page', {
    id: types.identifier(types.number),
    url: types.string,
    title: types.string,
    type: types.string,
    parent: types.maybe(types.number),
    active: types.boolean,
    views: 0,
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
    get pageCreator() {
      return getParent(self, 2).pageCreators.get(self.id);
    },
  }));

const PageCreator = types
  .model('PageCreator', {
    id: types.identifier(types.number),
    clientID: types.number,
    state: types.enumeration(fetchStates),
    url: '',
    title: '',
    type: types.optional(
      types.enumeration(['group', 'individual', 'related']),
      'related',
    ),
  })
  .views(self => ({
    get client() {
      return getRoot(self).clients.get(self.clientID);
    },
  }))
  .actions(self => ({
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
        clientID: self.clientID,
        type: self.type,
      };
      if (related) {
        query.parent = parent;
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
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    name: types.string,
    pages: types.optional(types.map(Page), {}),
    fetchPagesState: types.optional(types.enumeration(fetchStates), 'pending'),
    pageCreators: types.optional(types.map(PageCreator), {}),
  })
  .views(self => ({
    get pagesData() {
      return self.pages.values().filter(page => page.type !== 'related');
    },
    get totalViews() {
      return self.pagesData.length > 0
        ? self.pagesData.reduce((a, b) => a + b.views, 0)
        : 0;
    },
    get pageCreator() {
      return getRoot(self).pageCreators.get(self.id);
    },
    get clientStore() {
      return getRoot(self);
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
    addPageCreator(pageID) {
      const pageCreator = PageCreator.create({
        id: pageID,
        state: 'done',
        clientID: self.id,
      });
      self.pageCreators.put(pageCreator);
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
        self.addPageCreator(data[i]._id);
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
    id: types.identifier(),
    name: '',
    modalShown: false,
    state: types.enumeration(fetchStates),
  })
  .actions(self => ({
    setName(value) {
      self.name = value;
    },
    createClient() {
      self.state = 'pending';
      axios().post('v1/client', {
        name: self.name,
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
    clients: types.optional(types.map(Client), {}),
    pageCreators: types.optional(types.map(PageCreator), {}),
    clientCreator: types.reference(ClientCreator),
    state: types.enumeration(fetchStates),
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
      return self.clients.values();
    },
  }))
  .actions(self => ({
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    addPageCreator(clientID) {
      const pageCreator = PageCreator.create({
        id: clientID,
        state: 'done',
        clientID,
      });
      self.pageCreators.put(pageCreator);
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
      for (let i = 0; i < data.length; i += 1) {
        self.addPageCreator(data[i]._id);
        data[i].id = data[i]._id;
        self.clients.put(data[i]);
      }
      self.state = 'done';
    },
    fetchClientsError(error) {
      self.state = 'error';
    },
  }));

const clientStore = ClientStore.create({
  id: '1',
  state: 'pending',
  clientCreator: ClientCreator.create({
    id: '1',
    state: 'done',
  }),
});

export default clientStore;
