import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { DatePicker, Select, Button, Spin } from 'antd';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import style from '../../../style.css';

const { RangePicker } = DatePicker;
const Option = Select.Option;

class PromotionChart extends Component {
  componentWillMount() {
    this.props.chart.fetchChart();
  }

  updateDate = (dates, [startDate, endDate]) => {
    this.props.chart.setDate(startDate, endDate);
  }

  render() {
    const {
      chartData,
      startDate,
      endDate,
      fetchChart,
      setInterval,
      state
    } = this.props.chart;
    return (
      <div>
        <div className={style.tableOperations}>
          <Button onClick={fetchChart}>Перестроить</Button>
          <RangePicker
            defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
            onChange={this.updateDate}
            allowClear={false}
          />
          <Select defaultValue="days" style={{ width: 120 }} onChange={setInterval}>
            <Option value="days">По дням</Option>
            <Option value="months">По месяцам</Option>
          </Select >
        </div>
        <Spin spinning={state === 'pending'}>
          <ResponsiveContainer width="95%" height={300}>
            <BarChart data={chartData} >
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Bar name="Стоимость за клик" type="monotone" dataKey="y" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Spin>
      </div >
    );
  }
}

PromotionChart.propTypes = {

};

export default observer(PromotionChart);
