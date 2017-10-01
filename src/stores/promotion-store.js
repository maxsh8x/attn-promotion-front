import { action, observable } from 'mobx';
import axios from '../utils/axios';

class PromotionStore {
  @observable state = 'pending'
  @observable data = []
  @observable yandexData = observable.shallowMap()
  // @observable totalClick = 0
  // @observable totalCost = 0
  @observable inputData = {
    url: '',
    date: '',
  }
  @observable states = {
    createPage: 'success',
    fetchPages: 'pending',
  }

  @action updateInput(name, value) {
    this.inputData[name] = value;
  }

  @action fetchPages() {
    this.states.fetchPages = 'pending';
    return axios().get('v1/page', {
      params: {
        limit: 0,
        offset: 0,
        yDate: this.inputData.date,
      },
    },
    ).then(
      action('fetching pages success', ({ data }) => {
        this.data.replace(data);
        this.states.fetchPages = 'success';
      }),
      action('fetching pages failed', () => {
        this.states.fetchPages = 'failed';
      }),
    );
  }

  @action fetchMetrics(pageID) {
    return axios().get(
      'v1/metrics',
      {
        params: {
          yDate: this.inputData.date,
          pageID,
        },
      },
    ).then(
      action('fetching metrics success', ({ data }) => {
        this.yandexData.set(pageID, data);
      }),
      action('fetching metrics failed', () => { }),
    );
  }


  @action createPage() {
    this.states.createPage = 'pending';
    return axios().post(
      'v1/page',
      {
        url: this.inputData.url,
        title: 'sample',
      },
    ).then(
      action('page successfully created', () => {
        this.fetchPages();
        this.states.createPage = 'success';
      }),
      action('page creation failed', () => {
        this.states.createPage = 'failed';
      }),
    );
  }
}

const promotionStore = new PromotionStore();

export default promotionStore;

export { PromotionStore };
