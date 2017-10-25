import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DatePicker, Select } from 'antd';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import style from './PromotionChart.css';

const { RangePicker } = DatePicker;
const Option = Select.Option;

const Selector = () => (
  <Select defaultValue="days" style={{ width: 120 }} >
    <Option value="days">По дням</Option>
    <Option value="months">По месяцам</Option>
  </Select >
);

class PromotionChart extends Component {
  componentWillMount() {
    this.props.chart.fetchChart();
  }

  render() {
    const { chartData } = this.props.chart;
    return (
      <div>
        <div className={style.tableOperations}>
          <RangePicker />
          <Selector />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} >
            <Area name="Просмотры" type="monotone" dataKey="y" stroke="#8884d8" fill="#82ca9d" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

PromotionChart.propTypes = {

};

export default observer(PromotionChart);
