import { action, observable } from 'mobx';
import axios from '../utils/axios';

class PromotionStore {
  @observable state = 'pending'
  @observable data = []
  @observable yandexData = observable.shallowMap()
  @observable date = '2017-05-21'

  @action updateInput(name, value) {
    this[name] = value;
  }


  @action fetchPages() {
    return axios().get('v1/page', {
      params: { limit: 0, offset: 0 },
    },
    ).then(
      action('fetching metrics success', ({ data }) => {
        this.data.replace(data);
      }),
      action('fetching metrics failed', () => { }),
    );
  }

  @action fetchMetrics(pageID) {
    return axios().get(
      'v1/metrics',
      {
        params: {
          yDate: this.date,
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
}

const promotionStore = new PromotionStore();

export default promotionStore;

export { PromotionStore };
