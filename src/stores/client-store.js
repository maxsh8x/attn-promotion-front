import { types, getParent, process } from 'mobx-state-tree';
import axios from '../utils/axios';
import { randomUuid } from '../utils/random';

const Page = types.model({
  id: types.identifier(types.number),
  url: types.string,
  title: types.string,
  type: types.string,
  active: types.boolean,
  date: types.Date,
});

const PageCreator = types
  .model({
    state: 'done',
    id: types.optional(types.identifier(), randomUuid()),
    url: types.string,
    type: types.string,
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

const Client = types.model({
  id: types.identifier(types.number),
  name: types.string,
  pageCreator: types.reference(PageCreator),
});

const ClientCreator = types
  .model({
    id: types.identifier(),
    name: '',
    modalShown: false,
  })
  .views(self => ({
    get clientStore() {
      return getParent(self);
    },
  }))
  .actions((self) => {
    function setName(value) {
      self.name = value;
    }

    function create(value) {
      self.name = value;
    }

    function toggleModal() {
      self.modalShown = !self.modalShown;
    }

    return { setName, create, toggleModal };
  });

const ClientStore = types
  .model({
    clients: types.map(Client),
    clientCreator: types.reference(ClientCreator),
    state: types.enumeration(['pending', 'done', 'error']),
  })
  .views(self => ({
    get data() {
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
        self.clients.put(data[i]);
      }
      self.state = 'done';
    },
    fetchClientsError(error) {
      self.state = 'error';
    },
  }));

const clientStore = ClientStore.create({
  clients: {
    state: 'pending',
  },
  clientCreator: ClientCreator.create({
    id: randomUuid(),
  }),
});
export default clientStore;
