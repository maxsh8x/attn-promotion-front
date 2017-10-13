import { types, getRoot } from 'mobx-state-tree';
import axios from '../utils/axios';
import { randomUuid } from '../utils/random';

const fetchStates = ['pending', 'done', 'error'];

const Page = types.model('Page', {
  id: types.identifier(types.number),
  url: types.string,
  title: types.string,
  type: types.string,
  active: types.boolean,
  // date: types.Date,
});

const PageCreator = types
  .model('PageCreator', {
    id: types.identifier(types.number),
    state: types.enumeration(fetchStates),
    url: '',
    title: '',
    type: types.optional(
      types.enumeration(['group', 'individual', 'related']),
      'individual',
    ),
    parentPageID: types.undefined,
  })
  .actions(self => ({
    setURL(value) {
      self.url = value;
    },
    afterCreate() {
      // console.log(self, 'wtf')
    },
    createPage() {
      self.state = 'pending';
      axios().post('v1/page', {
        url: self.url,
        title: self.title,
        clientID: self.id,
        type: self.type,
        parent: self.parentPageID,
      }).then(
        self.createPageSuccess,
        self.createPageError,
      );
    },
    createPageSuccess() {
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
  })
  .views(self => ({
    get pagesData() {
      return self.pages.values();
    },
    get pageCreator() {
      return getRoot(self).pageCreators.get(self.id);
    },
  }))
  .actions(self => ({
    afterCreate() {
      console.log(getRoot(self), 'wtf');
      // getRoot(self).addPageCreator(self.id);
    },
    fetchPages() {
      self.fetchPagesState = 'pending';
      self.pages.clear();
      axios().get('v1/page/client', {
        params: {
          clientID: self.id,
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
    id: types.optional(
      types.identifier(),
      randomUuid(),
    ),
    name: '',
    modalShown: false,
    state: types.enumeration(fetchStates),
  })
  .views(self => ({
    get clientStore() {
      return getParent(self);
    },
  }))
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
  })
  .views(self => ({
    get clientsData() {
      return self.clients.values();
    },
  }))
  .actions(self => ({
    addPageCreator(clientID) {
      const pageCreator = PageCreator.create({
        id: clientID,
        state: 'done',
      });
      self.pageCreators.put(pageCreator);
    },
    fetchClients() {
      self.state = 'pending';
      // TODO: clear
      axios().get('v1/client', {
        params: {
          offset: 0,
          limit: 10,
          filter: '',
        },
      }).then(
        self.fetchClientsSuccess,
        self.fetchClientsError,
      );
    },
    fetchClientsSuccess({ data }) {
      for (let i = 0; i < data.length; i += 1) {
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
  state: 'pending',
  clientCreator: ClientCreator.create({
    state: 'done',
  }),
});

export default clientStore;
