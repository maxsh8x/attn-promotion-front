import { toJS, reaction } from 'mobx';
import { types, getParent, getRoot } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';

const UserCreator = types
  .model('UserCreator', {
    username: '',
    name: '',
    email: '',
    role: types.optional(
      types.enumeration([
        'root',
        'buchhalter',
        'manager',
      ]),
      'manager',
    ),
    password: '',
    modalShown: false,
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
    setUsername(value) {
      self.username = value;
    },
    setName(value) {
      self.name = value;
    },
    setEmail(value) {
      self.email = value;
    },
    setRole(value) {
      self.role = value;
    },
    setPassword(value) {
      self.password = value;
    },
    toggleModal() {
      self.modalShown = !self.modalShown;
    },
    createUser() {
      self.state = 'pending';
      axios().post('/v1/user', {
        username: self.username,
        name: self.name,
        email: self.email,
        role: self.role,
        password: self.password,
      }).then(
        self.createUserSuccess,
        self.createUserFailed,
      );
    },
    createUserSuccess() {
      self.toggleModal();
      self.username = '';
      self.name = '';
      self.email = '';
      self.role = 'manager';
      self.password = '';
      self.store.fetchUsers();
      message.info('Пользователь успешно создан');
      self.state = 'done';
    },
    createUserFailed() {
      message.error('Ошибка при создании пользователя');
      self.state = 'error';
    },
  }));

const ClientSelectorItem = types
  .model('ClientSelectorItem', {
    key: types.string,
    label: types.string,
  });

const ClientsBinder = types
  .model('ClientsBinder', {
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    clientSelector: types.optional(
      types.array(ClientSelectorItem),
      [],
    ),
  })
  .views(self => ({
    get user() {
      return getParent(self);
    },
  }))
  .actions(self => ({
    setClients(clients) {
      self.clientSelector.replace(clients);
    },
    bind() {
      self.state = 'pending';
      axios().post('v1/user/bind', {
        user: self.user.id,
        clients: self.clientSelector.map(item => parseInt(item.key, 10)),
        action: 'bind',
      }).then(
        self.bindSuccess,
        self.bindFailed,
      );
    },
    bindSuccess() {
      self.user.fetchClients();
      self.state = 'done';
    },
    bindFailed() {
      message.error('Ошибка при привязке пользователя');
      self.state = 'error';
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    name: types.string,
    brand: types.string,
    vatin: types.string,
    counterID: types.number,
    views: 0,
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get user() {
      return getParent(self, 2);
    },
  }))
  .actions(self => ({
    unbind() {
      self.state = 'pending';
      axios().post('v1/user/bind', {
        user: self.user.id,
        clients: [self.id],
        action: 'unbind',
      }).then(
        self.unbindSuccess,
        self.unbindFailed,
      );
    },
    unbindSuccess() {
      self.user.fetchClients();
      self.state = 'done';
    },
    unbindFailed() {
      message.error('Ошибка при отвязке пользователя');
      self.state = 'error';
    },
  }));

const User = types
  .model('User', {
    id: types.identifier(types.number),
    username: types.string,
    name: types.string,
    email: types.string,
    role: types.string,
    clients: types.optional(
      types.array(Client),
      [],
    ),
    clientsBinder: types.optional(
      ClientsBinder,
      {},
    ),
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
    current: 1,
    pageSize: 10,
    total: 0,
  })
  .views(self => ({
    get store() {
      return getRoot(self);
    },
    get clientsData() {
      return toJS(self.clients);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.current,
          self.pageSize,
        ],
        () => {
          self.fetchClients();
        },
      );
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    fetchClients() {
      self.state = 'pending';
      axios().get('v1/client', {
        params: {
          user: self.id,
          filter: '',
          type: 'all',
          limit: self.pageSize,
          offset: (self.current - 1) * self.pageSize,
          startDate: self.store.startDate,
          endDate: self.store.endDate,
        },
      }).then(
        self.fetchClientsSuccess,
        self.fetchClientsError,
      );
    },
    fetchClientsSuccess({ data }) {
      self.clients.replace(data.clientsData.map(item => ({
        ...item,
        id: item._id,
      })));
      self.total = data.total;
      self.state = 'done';
    },
    fetchClientsError(error) {
      message.error('Ошибка при получении клиентов');
      self.state = 'error';
    },
  }));

const UserStore = types
  .model('UserStore', {
    users: types.optional(
      types.array(User),
      [],
    ),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    userCreator: types.optional(
      UserCreator,
      {},
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
    get usersData() {
      return toJS(self.users);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.current,
          self.pageSize,
        ],
        () => {
          self.fetchUsers();
        },
      );
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchUsers() {
      self.state = 'pending';
      axios().get('v1/user', {
        params: {
          limit: self.pageSize,
          offset: (self.current - 1) * self.pageSize,
        },
      }).then(
        self.fetchUsersSuccess,
        self.fetchUsersError,
      );
    },
    fetchUsersSuccess({ data }) {
      self.users.replace(data.usersData.map(user => ({
        ...user,
        id: user._id,
      })));
      self.total = data.total;
      self.state = 'done';
    },
    fetchUsersError() {
      message.error('Ошибка при получении пользователей');
      self.state = 'error';
    },
  }));

const userStore = UserStore.create({});

export default userStore;
