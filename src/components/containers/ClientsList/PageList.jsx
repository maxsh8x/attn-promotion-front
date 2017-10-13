import React, { Component } from 'react';
import moment from 'moment';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Spin, Badge } from 'antd';
import AddPage from './AddPage';
import RelatedList from './RelatedList';

const StatusBadge = ({ active }) => {
  const status = active ? 'success' : 'error';
  const text = active ? 'Активна' : 'Неактивна';
  return <Badge status={status} text={text} />;
};

@inject('clientsStore') @observer
class PageList extends Component {
  componentWillMount() {
    this.props.client.fetchPages();
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>;
  }

  render() {
    const { client } = this.props;
    const spinning = !(client.fetchPagesState === 'done');

    const columns = [
      {
        dataIndex: 'url',
        title: 'Адрес',
        render: this.renderPageURL,
      },
      {
        dataIndex: 'title',
        title: 'Название',
      },
      {
        dataIndex: 'type',
        title: 'Тип',
      },
      {
        dataIndex: 'active',
        title: 'Статус',
        render: active => <StatusBadge active={active} />,
      },
      {
        dataIndex: 'createdAt',
        title: 'Дата создания',
        render: createdAt => moment(createdAt).format('YYYY-MM-DD'),
      },
    ];
    return (
      <div>
        <AddPage pageCreator={client.pageCreator} />
        <Spin spinning={spinning}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={client.pagesData}
            size="small"
            pagination={false}
            title={() => 'Список страниц клиента'}
          />
        </Spin>
      </div>
    );
  }
}

export default PageList;
