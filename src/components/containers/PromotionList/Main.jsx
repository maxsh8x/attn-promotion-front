import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Tabs, Table, DatePicker } from 'antd';
import YandexMetrics from './YandexMetrics';
import InputCost from './InputCost';
import style from './Main.css';

const TabPane = Tabs.TabPane;

@inject('promotionStore') @observer
class PromotionList extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    this.props.promotionStore.fetchPages();
  }

  expandedRowRender = ({ _id: pageID }) => (
    <div>
      <InputCost pageID={pageID} />
      <YandexMetrics pageID={pageID} />
    </div>
  )

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
          // { dataIndex: 'url', title: 'Страница', render: this.renderPageURL, width: '25%' },
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
    // dataSource={[].concat(...toJS(data).map(item =>
    //   [{ ...item, _id: `_${item._id}` }, { ...item }],
    // ))}
    return (
      <div style={{ marginBottom: 16 }}>
        <DatePicker />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Активные" key="1">
            <Table
              bordered
              rowKey="_id"
              dataSource={toJS(data)}
              columns={columns}
              title={() => 'Список продвигаемых страниц'}
              expandedRowRender={this.expandedRowRender}
            />
          </TabPane>
          <TabPane tab="Все" key="2" />
        </Tabs>
      </div>
    );
  }
}

export default PromotionList;
