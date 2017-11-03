import React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import { observer } from 'mobx-react';

const { RangePicker } = DatePicker;

const ViewsPeriod = ({ startDate, endDate, setDate }) => (
  <div>
    Подсчет просмотров за период: <RangePicker
      defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
      onChange={(dates, [startDate, endDate]) => setDate(startDate, endDate)}
      allowClear={false}
    />
  </div>
);

ViewsPeriod.propTypes = {

};

export default observer(ViewsPeriod);
