import { action, observable } from 'mobx';
import axios from '../utils/axios';

class ClientsStore {
  @observable modalShown = false
  @observable pagesData = observable.shallowMap()
  @observable createPageData = observable.shallowMap()
  @observable data = []
  @observable inputData = {
    name: '',
  }
  @observable states = {
    fetchPages: 'pending',
    createPage: 'success',
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

  @action fetchClients() {
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

  @action fetchPages(clientID) {
    this.states.fetchPages = 'pending';
    return axios().get('v1/page/client', {
      params: {
        clientID,
      },
    }).then(
      action('fetch pages success', ({ data }) => {
        this.pagesData.set(clientID, data);
        this.states.fetchPages = 'success';
      }),
      action('fetch pages failed', () => {
        this.states.fetchPages = 'failed';
      }),
    );
  }

  @action createPage(clientID) {
    this.states.createPage = 'pending';
    return axios().post(
      'v1/page',
      {
        url: this.inputData.url,
        title: '',
        clientID,
      },
    ).then(
      action('page successfully created', () => {
        this.fetchPages(clientID);
        this.states.createPage = 'success';
      }),
      action('page creation failed', () => {
        this.states.createPage = 'failed';
      }),
    );
  }
}

const clientsStore = new ClientsStore();

export default clientsStore;

export { ClientsStore };
