import React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import { observer } from 'mobx-react';

const { RangePicker } = DatePicker;

const Period = ({ startDate, endDate, setDate, label }) => (
  <span>
    {label && `${label}: `}<RangePicker
      defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
      onChange={(dates, [startDate, endDate]) => setDate(startDate, endDate)}
      allowClear={false}
    />
  </span>
);

Period.propTypes = {

};

export default observer(Period);
