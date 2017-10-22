import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { Tabs, Table, DatePicker, Spin, Popover, Switch } from 'antd';
import style from './Main.css';
import PageLayout from './PageLayout';


@inject('promotionStore') @observer
class PromotionList extends Component {
  componentWillMount() {
    this.props.promotionStore.fetchPages();
  }

  getTotal = (rowIndex, type) =>
    this.props.promotionStore.pages[rowIndex].total[type];

  expandedRowRender = (row, rowIndex) =>
    <PageLayout rowIndex={rowIndex} />

  metricRender = value => ((value && value.cost && value.clicks)
    ? (value.cost / value.clicks).toFixed(2)
    : 0)

  renderPageURL = (pageURL, { title, createdAt }) => {
    const content = (
      <div>
        <p>Создана: {moment(createdAt).format('YYYY-MM-DD')}</p>
      </div>
    );

    const urlParts = pageURL.split('/');
    return (
      <Popover content={content} title={title}>
        <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>
      </Popover>
    );
  }

  renderStatus = (active, { _id: pageID }, rowIndex) => (
    <Switch checked={active} />
  )

  render() {
    const { promotionStore } = this.props;
    const metricsCostColumns = promotionStore.metricNetworks.map(network => ({
      key: network,
      dataIndex: `inputs.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
      render: this.metricRender,
    }));

    const columns = [
      { key: 'status', dataIndex: 'active', render: this.renderStatus },
      { key: 'url', dataIndex: 'url', render: this.renderPageURL },
      {
        title: 'Стоимость за клик',
        children: metricsCostColumns,
      },
      {
        title: 'Итого',
        children: [
          {
            key: 'totalClicks',
            dataIndex: 'total.clicks',
            title: 'Кликов',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'clicks'),
          },
          {
            key: 'totalCost',
            dataIndex: 'total.cost',
            title: 'Потрачено',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'cost'),
          },
          {
            key: 'totalCostPerClick',
            dataIndex: 'total.costPerClick',
            title: 'Стоимость',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'costPerClick'),
          },
        ],
      },
    ];
    return (
      <div>
        <div className={style.tableOperations}>
          <DatePicker
            onChange={this.updateDate}
            value={moment(promotionStore.date, 'YYYY-MM-DD')}
            allowClear={false}
          />
        </div>

        <Spin spinning={promotionStore.state === 'pending'} >
          <Tabs defaultActiveKey="active" onChange={promotionStore.switchTab} animated={false}>
            <Tabs.TabPane tab={`Активные (${promotionStore.activePages})`} key="active">
              <Table
                bordered
                rowKey="id"
                dataSource={promotionStore.pagesData}
                columns={columns}
                title={() => 'Список продвигаемых страниц'}
                expandedRowRender={this.expandedRowRender}
                onChange={this.pagination}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Неактивные (${promotionStore.inactivePages})`} key="inactive">
              <Table
                bordered
                rowKey="id"
                dataSource={promotionStore.pagesData}
                columns={columns}
                title={() => 'Список продвигаемых страниц'}
                expandedRowRender={this.expandedRowRender}
                onChange={this.pagination}
              />
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }
}

PromotionList.propTypes = {

};

export default PromotionList;
