import { action, observable } from 'mobx';
import axios from '../utils/axios';
import promotionStore from './promotion-store';

class ClientSelectorStore {
  @observable state = 'success'
  @observable clients = []
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

  @action changeSelect(clients) {
    this.clients.replace(clients);
    this.data.clear();
    this.state = 'success';
    promotionStore.fetchPages(clients.map(x => x.key));
  }
}

const clientSelectorStore = new ClientSelectorStore();

export default clientSelectorStore;

export { ClientSelectorStore };
