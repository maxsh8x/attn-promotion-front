import { action, observable } from 'mobx';
import axios from '../utils/axios';

class ClientSelectorStore {
  @observable state = 'success'
  @observable value = []
  @observable data = []
  lastFetchID = 0

  @action fetchClients(filter) {
    this.lastFetchID += 1;
    const fetchID = this.lastFetchID;
    this.state = 'pending';
    return axios().get('v1/client/search', {
      params: {
        filter,
        limit: 5,
      },
    }).then(
      action('fetch clients success', ({ data }) => {
        if (fetchID !== this.lastFetchID) {
          return;
        }
        const newData = data.map(client => ({
          text: client.name,
          value: client._id,
        }));
        this.data.replace(newData);
        this.states = 'success';
      }),
      action('fetch clients failed', () => {

      }),
    );
  }

  @action changeSelect(value) {
    this.value.replace(value);
    this.data.clear();
    this.state = 'success';
  }
}

const clientSelectorStore = new ClientSelectorStore();

export default clientSelectorStore;

export { ClientSelectorStore };
