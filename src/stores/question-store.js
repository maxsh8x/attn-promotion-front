import { reaction, toJS } from 'mobx';
import { types, getParent } from 'mobx-state-tree';
import { message } from 'antd';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';

const GroupQuestionCreator = types
  .model('GroupQuestionCreator', {
    url: '',
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
    setCounterID(value) {
      const counterID = parseInt(value, 10);
      if (counterID) {
        self.counterID = counterID;
      } else if (value === '') {
        self.counterID = null;
      }
    },
    createGroupQuestion() {
      self.state = 'pending';
      axios().post('v1/page/group', {
        url: self.url,
        counterID: self.counterID,
      }).then(
        self.createGroupQuestionSuccess,
        self.createGroupQuestionError,
      );
    },
    createGroupQuestionSuccess() {
      self.toggleModal();
      self.store.fetchGroupQuestions();
      self.url = '';
      self.counterID = null;
      self.state = 'done';
    },
    createGroupQuestionError(error) {
      if (error.response.data.message === 'INVALID_COUNTER_ID') {
        message.error('Неверный ID счетчика');
      } else {
        message.error('Ошибка при создании группового вопроса');
      }
      self.state = 'error';
    },
    setURL(value) {
      self.url = value;
    },
    toggleModal() {
      self.modalShown = !self.modalShown;
    },
  }));

const Client = types
  .model('Client', {
    id: types.identifier(types.number),
    name: types.string,
    brand: types.string,
    vatin: types.string,
    minViews: types.number,
    maxViews: types.number,
    costPerClick: types.number,
    startDate: types.string,
    endDate: types.string,
  })
  .views(self => ({
    get question() {
      return getParent(self, 2);
    },
  }));

const ClientSelectorItem = types
  .model('ClientSelectorItem', {
    key: types.string,
    label: types.string,
  });

const ClientBinder = types
  .model('ClientBinder', {
    modalShown: false,
    clientSelector: types.optional(
      types.array(ClientSelectorItem),
      [],
    ),
    minViews: 0,
    maxViews: 0,
    costPerClick: 0,
    status: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
    startDate: types.optional(
      types.string,
      moment().add(1, 'days').format('YYYY-MM-DD'),
    ),
    endDate: types.optional(
      types.string,
      moment().add(3, 'months').format('YYYY-MM-DD'),
    ),
  })
  .views(self => ({
    get question() {
      return getParent(self);
    },
  }))
  .actions(self => ({
    toggleModal() {
      self.modalShown = !self.modalShown;
    },
    create() {
      self.status = 'pending';
      return axios().post('/v1/page/bind', {
        page: self.question.id,
        clients: self.clientSelector.map(item => parseInt(item.key, 10)),
        minViews: self.minViews,
        maxViews: self.maxViews,
        costPerClick: self.costPerClick,
        startDate: self.startDate,
        endDate: self.endDate,
      }).then(
        self.createSuccess,
        self.createError,
      );
    },
    createSuccess() {
      self.toggleModal();
      self.question.fetchClients();
      self.clientSelector.clear();
      self.minViews = 0;
      self.maxViews = 0;
      self.status = 'done';
    },
    createError() {
      message.error('Ошибка при привязке клиентов');
      self.status = 'error';
    },
    setClients(clients) {
      self.clientSelector.replace(clients);
    },
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
  }));

const Question = types
  .model('Question', {
    id: types.identifier(types.number),
    url: types.string,
    title: types.string,
    active: types.boolean,
    views: types.number,
    clients: types.optional(
      types.array(Client),
      [],
    ),
    clientsBinder: types.optional(ClientBinder, {}),
    current: 1,
    pageSize: 10,
    total: 0,
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
  })
  .views(self => ({
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
        () => self.fetchClients(),
      );
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    fetchClients() {
      self.state = 'pending';
      axios().get('v1/client/page', {
        params: {
          pageID: self.id,
          limit: self.pageSize,
          offset: (self.current - 1) * self.pageSize,
        },
      }).then(
        self.fetchClientsSuccess,
        self.fetchClientsError,
      );
    },
    fetchClientsSuccess({ data }) {
      self.clients.replace(data.clientsData.map(item => ({
        ...item,
        ...item.client,
        id: item.client._id,
      })));
      self.total = data.total;
      self.state = 'done';
    },
    fetchClientsError(error) {
      message.error('Ошибка при получении клиентов');
      self.state = 'error';
    },
  }));

const QuestionStore = types
  .model('QuestionStore', {
    tableType: types.optional(
      types.enumeration(['folded', 'unfolded']),
      'folded',
    ),
    questionsType: types.optional(
      types.enumeration(['group', 'individual']),
      'group',
    ),
    questions: types.optional(types.array(Question), []),
    groupQuestionCreator: types.optional(GroupQuestionCreator, {}),
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
    get questionsData() {
      return toJS(self.questions);
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => [
          self.current,
          self.pageSize,
        ],
        () => self.fetchQuestions(),
      );
      reaction(
        () => [
          self.startDate,
          self.endDate,
        ],
        () => self.fetchQuestions(true),
      );
    },
    switchTab(tabKey) {
      self.questionsType = tabKey;
      self.fetchQuestions();
    },
    setPagination(current, pageSize) {
      self.current = current;
      self.pageSize = pageSize;
    },
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchQuestions(onlyViews = false) {
      self.state = 'pending';
      axios().get('v1/page/questions', {
        params: {
          filter: '',
          type: self.questionsType,
          limit: self.pageSize,
          offset: (self.current - 1) * self.pageSize,
          startDate: self.startDate,
          endDate: self.endDate,
        },
      }).then(
        ({ data }) => self.fetchQuestionsSuccess(data, onlyViews),
        self.fetchQuestionsError,
      );
    },
    fetchQuestionsSuccess({ pageData, views, total }, onlyViews) {
      if (onlyViews) {
        self.questions.forEach((question) => {
          question.views = views[question.id] || 0;
        });
      } else {
        self.questions.replace(pageData.map(item => ({
          ...item,
          id: item._id,
        })));
      }
      self.total = total;
      self.state = 'done';
    },
    fetchQuestionsError(error) {
      message.error('Ошибка при получении вопросов');
      self.state = 'error';
    },
  }));

const questionStore = QuestionStore.create({});

export default questionStore;
