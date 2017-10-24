import { toJS } from 'mobx';
import { types, getParent } from 'mobx-state-tree';
import moment from 'moment';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

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
      axios().post('v1/page/', {
        url: self.url,
        counterID: self.counterID,
        type: 'group',
      }).then(
        self.fetchGroupQuestionsSuccess,
        self.fetchGroupQuestionsError,
      );
    },
    createGroupQuestionSuccess() {
      self.state = 'done';
    },
    createGroupQuestionError() {
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
  });

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
    bindClientStatus: types.optional(
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
    bindClients() {
      self.bindClientStatus = 'pending';
      return axios().post('/v1/page/bind', {
        page: self.question.id,
        clients: self.clientSelector.map(item => parseInt(item.key, 10)),
        minViews: self.minViews,
        maxViews: self.maxViews,
        startDate: self.startDate,
        endDate: self.endDate,
      }).then(
        self.bindClientsSuccess,
        self.bindClientsError,
      );
    },
    bindClientsSuccess() { },
    bindClientsError() { },
    setClients(clients) {
      self.clientSelector.replace(clients);
    },
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
  }));

const GroupQuestion = types
  .model('GroupQuestion', {
    id: types.identifier(types.number),
    url: types.string,
    title: types.string,
    active: types.boolean,
    views: 0, // null
    clients: types.optional(
      types.array(Client),
      [],
    ),
    clientsBinder: types.optional(ClientBinder, {}),
  })
  .views(self => ({
    get clientsData() {
      return toJS(self.clients);
    },
  }))
  .actions(self => ({
    fetchClients() {
      self.state = 'pending';
      axios().get('v1/client/page', {
        params: {
          pageID: self.id,
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

const GroupQuestionStore = types
  .model('GroupQuestionStore', {
    groupQuestions: types.optional(types.array(GroupQuestion), []),
    groupQuestionCreator: types.optional(GroupQuestionCreator, {}),
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
  })
  .views(self => ({
    get groupQuestionsData() {
      return toJS(self.groupQuestions);
    },
  }))
  .actions(self => ({
    setDate(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    },
    fetchGroupQuestions() {
      self.state = 'pending';
      axios().get('v1/page/group-questions', {
        params: {
          filter: '',
        },
      }).then(
        self.fetchGroupQuestionsSuccess,
        self.fetchGroupQuestionsError,
      );
    },
    fetchGroupQuestionsSuccess({ data }) {
      self.groupQuestions.replace(data.map(item => ({
        ...item,
        id: item._id,
      })));
      self.state = 'done';
    },
    fetchGroupQuestionsError(error) {
      self.state = 'error';
    },
  }));

const groupQuestionStore = GroupQuestionStore.create({});

export default groupQuestionStore;
