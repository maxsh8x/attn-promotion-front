import { reaction, toJS } from 'mobx';
import { types, addDisposer, getParent } from 'mobx-state-tree';
import moment from 'moment';
import axios from '../utils/axios';
import { fetchStates } from '../constants';


const ReportItem = types
  .model('ReportItem', {
    id: types.string,
    views: 0,
    clicks: 0,
    cost: 0,
  });

const ReportStore = types
  .model('ReportStore', {
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

const reportStore = ReportStore.create({});

export default reportStore;
