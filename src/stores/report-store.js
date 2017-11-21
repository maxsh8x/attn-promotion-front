import { toJS } from 'mobx';
import { types } from 'mobx-state-tree';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';
import TableSettings from './table-settings';


const ReportItem = types
  .model('ReportItem', {
    id: types.string,
    views: types.maybe(types.number),
    clicks: types.maybe(types.number),
    cost: types.maybe(types.number),
  });

const ReportStore = types
  .model('ReportStore', {
    tabSettings: types.map(TableSettings),
    data: types.optional(types.array(ReportItem), []),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get reportData() {
      return toJS(self.data);
    },
    get settings() {
      return self.tabSettings.get('general');
    },
  }))
  .actions(self => ({
    fetchReport(params) {
      self.state = 'pending';
      const template = 'YYYY-MM-DD';
      const startDate = moment(params.startDate).format(template);
      const endDate = moment(params.endDate).format(template);
      axios().get('v1/metrics/report', {
        params: {
          ...params,
          startDate,
          endDate,
        },
      }).then(
        self.fetchReportSuccess,
        self.fetchReportError,
      );
    },
    fetchReportSuccess({ data }) {
      self.data.replace(data);
      self.state = 'done';
    },
    fetchReportError() {
      self.state = 'error';
    },
  }));

const reportStore = ReportStore.create({
  tabSettings: {
    general: {},
  },
});

export default reportStore;
