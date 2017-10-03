import { action, observable, extendObservable } from 'mobx';
import { message } from 'antd';
import axios from '../utils/axios';


class PromotionStore {
  @observable state = 'pending'
  @observable data = []
  @observable yandexData = observable.shallowMap()
  @observable inputPageData = observable.map()
  @observable inputData = {
    url: '',
    date: '',
  }
  @observable states = {
    createPage: 'success',
    fetchPages: 'pending',
    fetchMetrics: 'pending',
  }

  constructor() {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    this.inputData.date = yesterdayDate.toISOString().slice(0, 10);
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
      rowIndex,
    } = params;

    this.data[rowIndex].metrics[source][type] = value;

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

        const metricsInitState = {};
        for (let i = 0; i < data.metricNetworks.length; i++) {
          metricsInitState[data.metricNetworks[i]] = {
            cost: 0,
            clicks: 0,
          };
        }

        const flatInput = {};
        for (let i = 0; i < data.input.length; i++) {
          flatInput[data.input[i]._id.page] = { ...metricsInitState };
          for (let x = 0; x < data.input[i].sources.length; x++) {
            flatInput[data.input[i]._id.page][data.input[i].sources[x]] = {
              cost: data.input[i].cost[x],
              clicks: data.input[i].clicks[x],
            };
          }
        }

        for (let i = 0; i < data.pages.length; i++) {
          const item = {
            _id: data.pages[i]._id,
            url: data.pages[i].url,
            metrics: flatInput[data.pages[i]._id]
              ? { ...metricsInitState, ...flatInput[data.pages[i]._id] }
              : metricsInitState
            ,
          };
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
