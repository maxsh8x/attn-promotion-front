import { reaction, toJS } from 'mobx';
import { types, getRoot, getParent, addDisposer } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';
import TableSettings from './table-settings';

export const PageMetaCreator = types
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
    createError({ response: { data: { message: errMsg } } }) {
      let response = 'Ошибка при создании страницы';
      switch (errMsg) {
        case 'ALREADY_EXISTS': {
          response = 'Ошибка: индивидуальный вопрос существует';
          break;
        }
        default:
          break;
      }
      message.error(response);
      self.state = 'error';
    },
    toggleModal(modalClientID = null) {
      if (modalClientID) {
        self.modalClientID = modalClientID;
      }
      self.modalShown = !self.modalShown;
    },
  }));

export const ArchiveEntity = types
  .model('ArchiveEntity', {
    id: types.identifier(types.string),
    minViews: types.number,
    maxViews: types.number,
    views: types.number,
    viewsPeriod: types.number,
    costPerClick: types.number,
    startDate: types.string,
    endDate: types.string,
  });

export const Page = types
  .model('Page', {
    id: types.identifier(types.number),
    archiveID: types.maybe(types.string),
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
    archive: types.optional(types.array(ArchiveEntity), []),
    state: types.optional(types.enumeration(fetchStates), 'pending'),
    archiveState: types.optional(types.enumeration(fetchStates), 'pending'),
  })
  .views(self => ({
    get archiveData() {
      return toJS(self.archive);
    },
    get pages() {
      return getParent(self);
    },
    get client() {
      return getParent(self, 2);
    },
    get store() {
      return getRoot(self);
    },
  }))
  .actions(self => ({
    metaToArchive() {
      self.state = 'pending';
      axios().post('/v1/archive', {
        pageID: self.id,
        clientID: self.client.id,
      }).then(
        self.metaToArchiveSuccess,
        self.metaToArchiveErrror,
      );
    },
    metaToArchiveSuccess() {
      message.info('Кампания отправлена в архив');
      self.state = 'done';
      self.client.fetchPages();
    },
    metaToArchiveError() {
      message.error('Ошибка при добавлении кампании в архив');
      self.state = 'error';
    },
    archiveToMeta() {
      self.state = 'pending';
      axios().delete(`/v1/archive/${self.archiveID}`,
      ).then(
        self.archiveToMetaSucess,
        self.archiveToMetaError,
      );
    },
    archiveToMetaSucess() {
      message.info('Кампания успешно восстановлена');
      self.state = 'done';
      self.client.fetchPages();
    },
    archiveToMetaError({ response: { data: { message: errMsg } } }) {
      let response = 'Ошибка при восстановлении кампании';
      switch (errMsg) {
        case 'ALREADY_EXISTS': {
          response = 'Ошибка: кампания уже привязана';
          break;
        }
        default:
          break;
      }
      message.error(response);
      self.state = 'error';
    },
    fetchArchive() {
      self.archiveState = 'pending';
      axios().get('/v1/archive/pageHistorical/', {
        params: {
          startDate: self.store.startDate,
          endDate: self.store.endDate,
          clientID: self.client.id,
          type: self.store.activeTab,
          pageID: self.id,
        },
      }).then(
        self.fetchArchiveSuccess,
        self.fetchArchiveError,
      );
    },
    fetchArchiveSuccess({ data }) {
      self.archive.replace(data);
      self.archiveState = 'done';
    },
    fetchArchiveError() {
      message.error('Ошибка при получении архивных данных');
      self.archiveState = 'error';
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    activeTab: types.optional(
      types.enumeration(['active', 'archived']),
      'active',
    ),
    counterID: types.number,
    name: types.string,
    brand: types.string,
    vatin: types.string,
    views: types.number,
    cost: types.number,
    pages: types.optional(types.array(Page), []),
    state: types.optional(types.enumeration(fetchStates), 'pending'),
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
          self.activeTab,
        ],
        () => self.fetchPages(),
      );
      addDisposer(self, disposer);
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.settings.setPageSize(pageSize);
    },
    switchTab(tabKey) {
      self.current = 1;
      self.activeTab = tabKey;
    },
    fetchPages() {
      self.state = 'pending';
      self.pages.clear();
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
      const url = self.activeTab === 'active'
        ? 'v1/page/client'
        : 'v1/archive/latest';
      axios().get(url, {
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
      self.state = 'done';
    },
    fetchPagesError() {
      message.error('Ошибка при получении страниц');
      self.state = 'error';
    },
  }));

export const ClientCreator = types
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
      message.info('Клиент успешно создан');
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

export const ClientStore = types
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
    commitInput(id, field, value) {
      axios().patch(`/v1/client/${id}`, {
        [field]: value,
      }).then(
        () => message.info('Данные сохранены'),
        () => message.info('Ошибка при сохранении'),
      );
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
