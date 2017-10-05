import { action, observable } from 'mobx';
import { message } from 'antd';
import axios from '../utils/axios';


class PromotionStore {
  @observable data = []
  @observable yandexData = observable.shallowMap()
  @observable inputData = {
    isActiveTab: true,
    activePages: 0,
    inactivePages: 0,
    limit: 10,
    offset: 0,
    url: '',
    date: '',
  }
  @observable states = {
    createPage: 'success',
    fetchPages: 'pending',
    fetchMetrics: 'pending',
  }
  @observable metricNetworks = []

  constructor() {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    this.inputData.date = yesterdayDate.toISOString().slice(0, 10);
  }

  getYData(pageID) {
    return this.yandexData.get(`${pageID}_${this.inputData.date}`);
  }

  @action updateInput(name, value) {
    this.inputData[name] = value;
  }

  @action setTotalCost(pageID, totalCost) {
    this.totalCost.set(pageID, totalCost);
  }

  @action commitInputChanges(params) {
    const {
      source,
      type,
      pageID,
      value,
      rowIndex,
    } = params;

    const networks = this.data[rowIndex].networks;
    networks[source][type] = value;
    const total = {
      cost: 0,
      clicks: 0,
      costPerClick: 0,
    };

    const metricNetworks = this.metricNetworks.toJS();
    for (let i = 0; i < metricNetworks.length; i += 1) {
      total.cost += networks[metricNetworks[i]].cost;
      total.clicks += networks[metricNetworks[i]].clicks;
    }
    if (total.cost && total.clicks) {
      total.costPerClick = (total.cost / total.clicks).toFixed(2);
    }
    this.data[rowIndex].total = total;

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

  @action updateStatus = (pageID, active, rowIndex) => {
    return axios().patch(`v1/page/${pageID}/status`, {
      active,
    }).then(
      action('update status success', () => {
        this.data[rowIndex].active = active;
      }),
      action('update status failed', () => { }),
    );
  }

  @action fetchPages() {
    this.states.fetchPages = 'pending';
    return axios().get('v1/page', {
      params: {
        limit: this.inputData.limit,
        offset: this.inputData.offset,
        yDate: this.inputData.date,
        active: this.inputData.isActiveTab,
      },
    },
    ).then(
      action('fetching pages success', ({ data }) => {
        this.metricNetworks.replace(data.metricNetworks);
        this.inputData.inactivePages = data.inactivePages;
        this.inputData.activePages = data.activePages;
        const newData = [];
        const networksInitState = {};

        for (let i = 0; i < data.metricNetworks.length; i += 1) {
          networksInitState[data.metricNetworks[i]] = {
            cost: 0,
            clicks: 0,
          };
        }

        const flatInput = {};
        for (let i = 0; i < data.input.length; i += 1) {
          flatInput[data.input[i]._id.page] = { ...networksInitState };
          for (let x = 0; x < data.input[i].sources.length; x += 1) {
            flatInput[data.input[i]._id.page][data.input[i].sources[x]] = {
              cost: data.input[i].cost[x],
              clicks: data.input[i].clicks[x],
            };
          }
        }

        for (let i = 0; i < data.pages.length; i += 1) {
          const item = {
            _id: data.pages[i]._id,
            url: data.pages[i].url,
            title: data.pages[i].title,
            active: data.pages[i].active,
            createdAt: data.pages[i].createdAt,
            networks: flatInput[data.pages[i]._id]
              ? { ...networksInitState, ...flatInput[data.pages[i]._id] }
              : networksInitState,
            total: {
              cost: 0,
              clicks: 0,
              costPerClick: 0,
            },
          };

          for (let x = 0; x < data.metricNetworks.length; x += 1) {
            item.total.cost += item.networks[data.metricNetworks[x]].cost;
            item.total.clicks += item.networks[data.metricNetworks[x]].clicks;
          }
          if (item.total.cost && item.total.clicks) {
            item.total.costPerClick = (item.total.cost / item.total.clicks).toFixed(2);
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
        this.yandexData.set(`${pageID}_${this.inputData.date}`, data);
        this.states.fetchMetrics = 'success';
      }),
      action('fetching metrics failed', () => {
        this.states.fetchMetrics = 'failed';
      }),
    );
  }

  @action updateData(pageID) {
    return axios().post('/v1/metrics', {
      yDate: this.inputData.date,
      pageID,
    }).then(
      action('metrics update success', () => {
        this.fetchMetrics(pageID);
      }),
      action('metrics update failed', () => { }),
    );
  }

  @action createPage() {
    this.states.createPage = 'pending';
    return axios().post(
      'v1/page',
      {
        url: this.inputData.url,
        title: '',
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
