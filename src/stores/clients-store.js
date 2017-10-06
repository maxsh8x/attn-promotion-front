import { action, observable } from 'mobx';
import axios from '../utils/axios';

class ClientsStore {
  @observable modalShown = false
  @observable data = []
  @observable inputData = {
    name: '',
  }

  @action toggleModal() {
    this.modalShown = !this.modalShown;
  }

  @action updateInput(name, value) {
    this.inputData[name] = value;
  }

  @action createClient() {
    return axios().post('v1/client', {
      ...this.inputData,
    }).then(
      action('client successfully created', () => {
        this.fetchClients();
        this.toggleModal();
      }),
      action('client create failed', () => { }),
    );
  }

  @action fetchClients = () => {
    return axios().get('v1/client', {
      params: {
        offset: 0,
        limit: 10,
        filter: '',
      },
    }).then(
      action('fetch clients success', ({ data }) => {
        this.data.replace(data);
      }),
      action('fetch clients failed', () => { }),
    );
  }
}

const clientsStore = new ClientsStore();

export default clientsStore;

export { ClientsStore };
