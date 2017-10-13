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
  componentDidMount() {
    this.props.client.loadPages();
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>;
  }

  render() {
    const { client } = this.props;
    const data = client.pages ? client.pages.pagesData : [];
    const spinning = Boolean(client.pages && client.pages.state === 'done');

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
        {/* <AddPage clientID={clientID} /> */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          size="small"
          pagination={false}
          title={() => 'Список страниц клиента'}
        />
      </div>
    );
  }
}

export default PageList;
