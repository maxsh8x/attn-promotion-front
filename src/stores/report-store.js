import { types } from 'mobx-state-tree';

const ReportStore = types
  .model('ReportStore', {});

const reportStore = ReportStore.create({});

export default reportStore;
