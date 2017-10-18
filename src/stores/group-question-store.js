import { types } from 'mobx-state-tree';
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

const GroupQuestion = types
  .model('GroupQuestion', {
    id: types.identifier(types.number),
    url: types.string,
    title: types.string,
    active: types.boolean,
    views: 0, // null
  });

const GroupQuestionStore = types
  .model('GroupQuestionStore', {
    groupQuestions: types.optional(types.map(GroupQuestion), {}),
    groupQuestionCreator: types.optional(GroupQuestionCreator, {}),
    state: types.optional(
      types.enumeration(fetchStates),
      'pending',
    ),
  })
  .views(self => ({
    get groupQuestionsData() {
      return self.groupQuestions.values();
    },
  }))
  .actions(self => ({
    afterCreate() {
      self.fetchGroupQuestions();
    },
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
      for (let i = 0; i < data.length; i += 1) {
        data[i].id = data[i]._id;
        self.groupQuestions.put(data[i]);
      }
      self.state = 'done';
    },
    fetchGroupQuestionsError(error) {
      self.state = 'error';
    },
  }));

const groupQuestionStore = GroupQuestionStore.create({});

export default groupQuestionStore;
