import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Button, Modal, Table, Card, Spin, Input, Icon } from 'antd';
import YandexMetrics from './YandexMetrics';
import EditableCell from './EditableCell';
import style from './Main.css';


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


  onCellChange = (key, dataIndex) => {
    return (value) => {
      const dataSource = [...this.state.dataSource];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.setState({ dataSource });
      }
    };
  }

  editableCell = (text, record) => (
    <EditableCell
      value={text}
      onChange={this.onCellChange(record.key, 'name')}
    />
  )

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return urlParts[urlParts.length - 2];
  }

  render() {
    const { data } = this.props.promotionStore;

    console.log(style.test)
    const columns = [
      { dataIndex: 'url', render: this.renderPageURL, className: style.test },
      {
        title: 'Сети',
        children: [
          // { dataIndex: 'url', title: 'Страница', render: this.renderPageURL, width: '25%' },
          { dataIndex: 'metrics.google', title: 'Google', render: this.editableCell },
          { dataIndex: 'metrics.facebook', title: 'Facebook', render: this.editableCell },
          { dataIndex: 'metrics.vk', title: 'Vk', render: this.editableCell },
          { dataIndex: 'metrics.instagram', title: 'Instagram', render: this.editableCell },
          { dataIndex: 'metrics.yandex', title: 'Yandex', render: this.editableCell },
        ],
      }, {
        title: 'Общие',
        children: [
          { dataIndex: 'metrics.yandexx', title: 'Реклама всего', render: this.editableCell },
          { dataIndex: 'metrics.yandexz', title: 'Социальные сети', render: this.editableCell },
          { dataIndex: 'metrics.yandexc', title: 'Ссылки на сайт', render: this.editableCell },
          { dataIndex: 'metrics.yandexv', title: 'Внутренние переходы', render: this.editableCell },
          { dataIndex: 'metrics.yandexs', title: 'Прямые заходы', render: this.editableCell },
        ],
      },
    ];

    return (<Card>
      <Table
        bordered
        rowKey="_id"
        dataSource={data.toJS()}
        columns={columns}
        title={() => 'Список объявлений'}
        expandedRowRender={({ _id: pageID }) => (<YandexMetrics pageID={pageID} />)}
      />
    </Card>
    );
  }
}

export default PromotionList;
