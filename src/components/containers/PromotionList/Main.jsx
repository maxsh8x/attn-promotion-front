import React, { Component } from 'react';
import moment from 'moment';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Tabs, Table, DatePicker, Spin, Switch } from 'antd';
import YandexMetrics from './YandexMetrics';
import AddPage from './AddPage';
import InputCost from './InputCost';

const TabPane = Tabs.TabPane;

@inject('promotionStore') @observer
class PromotionList extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.updateDate = this.updateDate.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    this.props.promotionStore.fetchPages();
  }

  onTabChange(tabKey) {
    const isActive = tabKey === 'active';
    this.props.promotionStore.fetchPages(isActive);
  }

  updateDate(date, dateString) {
    this.props.promotionStore.updateInput('date', dateString);
    this.props.promotionStore.fetchPages();
  }

  updateStatus(pageID, active, rowIndex) {
    this.props.promotionStore.updateStatus(pageID, active, rowIndex);
  }

  expandedRowRender = ({ _id: pageID }, rowIndex) => {
    return (
      <div>
        <InputCost pageID={pageID} rowIndex={rowIndex} />
        <YandexMetrics pageID={pageID} rowIndex={rowIndex} />
      </div>
    );
  }


  metricRender = value => ((value.cost && value.clicks)
    ? (value.cost / value.clicks).toFixed(2)
    : 0)

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return urlParts[urlParts.length - 2];
  }

  renderStatus = (active, { _id: pageID }, rowIndex) => (
    <Switch checked={active} onChange={checked => this.updateStatus(pageID, checked, rowIndex)} />
  )

  render() {
    const { data, inputData } = this.props.promotionStore;

    // TODO: generator
    const columns = [
      { key: 'status', dataIndex: 'active', render: this.renderStatus },
      { key: 'url', dataIndex: 'url', render: this.renderPageURL },
      {
        title: 'Стоимость за клик',
        children: [
          { key: 'google', dataIndex: 'networks.google', title: 'Google', render: this.metricRender },
          { key: 'facebook', dataIndex: 'networks.facebook', title: 'Facebook', render: this.metricRender },
          { key: 'vk', dataIndex: 'networks.vk', title: 'Vk', render: this.metricRender },
          { key: 'odnoklassniki', dataIndex: 'networks.odnoklassniki', title: 'Odnoklassniki', render: this.metricRender },
          { key: 'yandex', dataIndex: 'networks.yandex', title: 'Yandex', render: this.metricRender },
        ],
      },
      {
        title: 'Итого',
        children: [
          { key: 'totalClicks', dataIndex: 'total.clicks', title: 'Кликов' },
          { key: 'totalCost', dataIndex: 'total.cost', title: 'Потрачено' },
          { key: 'totalCostPerClick', dataIndex: 'total.costPerClick', title: 'Стоимость' },
        ],
      },
    ];

    // Table to external component
    return (
      <div>
        <DatePicker onChange={this.updateDate} defaultValue={moment(inputData.date, 'YYYY-MM-DD')} />
        <AddPage />
        <Tabs defaultActiveKey="active" onChange={this.onTabChange} animated={false}>
          <TabPane tab="Активные" key="active">
            <Spin spinning={this.props.promotionStore.states.fetchPages !== 'success'}>
              <Table
                bordered
                rowKey="_id"
                dataSource={toJS(data)}
                columns={columns}
                title={() => 'Список продвигаемых страниц'}
                expandedRowRender={this.expandedRowRender}
              />
            </Spin>
          </TabPane>
          <TabPane tab="Неактивные" key="inactive">
            <Spin spinning={this.props.promotionStore.states.fetchPages !== 'success'}>
              <Table
                bordered
                rowKey="_id"
                dataSource={toJS(data)}
                columns={columns}
                title={() => 'Список продвигаемых страниц'}
                expandedRowRender={this.expandedRowRender}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default PromotionList;
