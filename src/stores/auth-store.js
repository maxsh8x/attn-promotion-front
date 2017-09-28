import { action, observable } from 'mobx';
import axios from '../utils/axios';

class AuthStore {
  @observable username = ''
  @observable password = ''
  @observable state = 'pending'

  // TODO: refactor userInput
  @action updateInput(name, value) {
    this[name] = value;
  }

  @action login() {
    return axios().post('v1/login', {
      username: this.username,
      password: this.password,
    }).then(
      action('login success', ({ data }) => {
        const { token } = data;
        localStorage.setItem('token', token);
        this.state = 'success';
        window.location.href = '/';
      }),
      action('login failed', () => {
        this.state = 'failed';
      }),
    );
  }
}

const authStore = new AuthStore();

export default authStore;

export { AuthStore };
