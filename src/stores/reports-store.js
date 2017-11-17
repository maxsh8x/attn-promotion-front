import { types } from 'mobx-state-tree';

const ReportsStore = types
  .model('ReportsStore', {});

const reportsStore = ReportsStore.create({});

export default reportsStore;
