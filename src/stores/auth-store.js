import { types } from 'mobx-state-tree';
import { message } from 'antd';
import axios from '../utils/axios';
import { fetchStates } from '../constants';

const AuthStore = types
  .model('AuthStore', {
    username: '',
    password: '',
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .actions(self => ({
    setUsername(value) {
      self.username = value;
    },
    setPassword(value) {
      self.password = value;
    },
    login() {
      axios().post('v1/login', {
        username: self.username,
        password: self.password,
      }).then(
        self.loginSuccess,
        self.loginFailed,
      );
    },
    loginSuccess({ data }) {
      localStorage.setItem('token', data.token);
      window.location.href = '/';
      self.state = 'done';
    },
    loginFailed() {
      message.error('Ошибка при авторизации');
      self.state = 'failed';
    },
  }));

const authStore = AuthStore.create({});

export default authStore;
