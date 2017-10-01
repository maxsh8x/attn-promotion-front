import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Tabs, Table, DatePicker, Spin } from 'antd';
import YandexMetrics from './YandexMetrics';
import AddPage from './AddPage';
import InputCost from './InputCost';
import style from './Main.css';

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
  }

  componentDidMount() {
    this.props.promotionStore.fetchPages();
  }

  expandedRowRender = ({ _id: pageID }) => (
    <div>
      <InputCost pageID={pageID} />
      <YandexMetrics pageID={pageID} />
    </div>
  )

  updateDate(date, dateString) {
    this.props.promotionStore.updateInput('date', dateString);
    this.props.promotionStore.fetchPages();
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return urlParts[urlParts.length - 2];
  }


  render() {
    const { data } = this.props.promotionStore;

    const columns = [
      { dataIndex: 'url', render: this.renderPageURL, className: style.test },
      {
        title: 'Цена за клик',
        children: [
          { dataIndex: 'metrics.google', title: 'Google' },
          { dataIndex: 'metrics.facebook', title: 'Facebook' },
          { dataIndex: 'metrics.vk', title: 'Vk' },
          { dataIndex: 'metrics.odnoklassniki', title: 'Odnoklassniki' },
          { dataIndex: 'metrics.yandex', title: 'Yandex' },
        ],
      },
      { title: 'Кликов' },
      { title: 'Всего потрачено' },
    ];

    return (
      <div>
        <DatePicker onChange={this.updateDate} />
        <AddPage />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Активные" key="1">
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
          <TabPane tab="Неактивные" key="2" />
        </Tabs>
      </div>
    );
  }
}

export default PromotionList;
