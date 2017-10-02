import { action, observable, computed } from 'mobx';
import { message } from 'antd';
import axios from '../utils/axios';

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);

class PromotionStore {
  @observable state = 'pending'
  @observable data = []
  @observable yandexData = observable.shallowMap()
  @observable inputPageData = observable.map()
  @observable inputData = {
    url: '',
    date: yesterdayDate.toISOString().slice(0, 10),
  }
  @observable states = {
    createPage: 'success',
    fetchPages: 'pending',
    fetchMetrics: 'pending',
  }

  @action updateInput(name, value) {
    this.inputData[name] = value;
  }

  @action commitInputChanges(params) {
    const {
      source,
      type,
      pageID,
      value,
    } = params;

    // if (source in this.inputPageData.get(pageID)) {
    //   this.inputPageData.get(pageID)[source][type] = value;
    // } else {
    //   this.inputPageData.get(pageID)[source] = { [type]: value };
    // }

    return axios().post('v1/input', {
      yDate: this.inputData.date,
      source,
      type,
      pageID,
      value,
    }).then(
      action('input commit success', () => {
        message.info('Изменения сохранены');
      }),
      action('input commit failed', () => { }),
    );
  }

  @action fetchPages(active = true) {
    this.states.fetchPages = 'pending';
    return axios().get('v1/page', {
      params: {
        limit: 50,
        offset: 0,
        yDate: this.inputData.date,
        active,
      },
    },
    ).then(
      action('fetching pages success', ({ data }) => {
        const newData = [];

        for (let i = 0; i < data.length; i++) {
          const item = {
            _id: data[i]._id,
            url: data[i].url,
            metrics: {},
          };
          for (let x = 0; x < data[i].sources.length; x++) {
            item.metrics[data[i].sources[x]] = {
              cost: data[i].cost[x],
              clicks: data[i].clicks[x],
            };
          }
          newData.push(item);
        }

        this.data.replace(newData);
        this.states.fetchPages = 'success';
      }),
      action('fetching pages failed', () => {
        this.states.fetchPages = 'failed';
      }),
    );
  }

  @action fetchMetrics(pageID) {
    this.states.fetchMetrics = 'pending';
    this.inputPageData.delete(pageID);
    this.yandexData.delete(pageID);
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
        this.inputPageData.set(pageID, data.input);
        this.yandexData.set(pageID, data.yandex);
        this.states.fetchMetrics = 'success';
      }),
      action('fetching metrics failed', () => {
        this.states.fetchMetrics = 'failed';
      }),
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
