import { types, getParent, process } from 'mobx-state-tree';
import axios from '../utils/axios';
import { randomUuid } from '../utils/random';

const Page = types.model({
  id: types.identifier(types.number),
  url: types.string,
  title: types.string,
  type: types.string,
  active: types.boolean,
  // date: types.Date,
});

const PageCreator = types
  .model('PageCreator', {
    state: 'done',
    id: types.identifier(),
    url: types.string,
    type: types.optional(
      types.enumeration(['group', 'individual']),
      'individual',
    ),
  })
  .views(self => ({
    get client() {
      return getParent(self);
    },
  }))
  .actions((self) => {
    const create = process(function* createPage() {
      try {
        yield axios().post({
          url: self.url,
          clientID: self.client.id,
          type: self.type,
          title: '',
        });
        self.state = 'done';
      } catch (e) {
        self.state = 'error';
      }
    });
    return { create };
  });

const Pages = types
  .model('Pages', {
    id: types.identifier(types.number),
    pages: types.optional(types.map(Page), {}),
    state: types.enumeration(['pending', 'done', 'error']),
  })
  .views(self => ({
    get pagesData() {
      return self.pages.values();
    },
  }))
  .actions(self => ({

    fetchPages() {
      self.state = 'pending';
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
      self.state = 'done';
    },
    fetchPagesError() {
      self.state = 'error';
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    name: types.string,
    pageCreator: types.maybe(types.reference(PageCreator)),
    pages: types.maybe(types.reference(Pages)),
  })
  .actions(self => ({
    loadPages() {
      // lazy loading
      self.pages = Pages.create({
        id: self.id,
        state: 'pending',
      });
      self.pages.fetchPages();
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
    state: types.enumeration(['pending', 'done', 'error']),
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
    clientCreator: types.reference(ClientCreator),
    state: types.enumeration(['pending', 'done', 'error']),
  })
  .views(self => ({
    get clientsData() {
      return self.clients.values();
    },
  }))
  .actions(self => ({
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
