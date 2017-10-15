import React, { Component } from 'react';
import moment from 'moment';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Spin, Badge, Switch } from 'antd';
import AddPage from './AddPage';
import RelatedList from './RelatedList';

// const StatusBadge = ({ active }) => {
//   const status = active ? 'success' : 'error';
//   const text = active ? 'Активна' : 'Неактивна';
//   return <Badge status={status} text={text} />;
// };

const renderPageURL = (pageURL) => {
  const urlParts = pageURL.split('/');
  return <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>;
};

const typeNames = {
  individual: 'Индивидуальный',
  group: 'Групповой',
};

const basicColumns = [
  {
    dataIndex: 'active',
    title: 'Статус',
    render: active => <Switch checked={active} />,
  },
  {
    dataIndex: 'url',
    title: 'Адрес',
    render: renderPageURL,
  },
  {
    dataIndex: 'title',
    title: 'Название',
  },
  {
    dataIndex: 'views',
    title: 'Просмотров',
  },
];

@observer
class PageList extends Component {
  componentWillMount() {
    this.props.client.fetchPages();
  }

  expandedRowRender = ({ id, type }) => {
    if (type === 'group') {
      const { client } = this.props;
      const page = client.pages.get(id);
      return (
        <div>
          <AddPage pageCreator={page.pageCreator} parent={id} related />
          <Table
            rowKey="id"
            columns={basicColumns}
            dataSource={page.pagesData}
            size="small"
            pagination={false}
            footer={() => `Всего просмотров: ${page.totalViews}`}
            title={() => 'Список страниц группового вопроса'}
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const { client } = this.props;
    const spinning = !(client.fetchPagesState === 'done');
    const columns = basicColumns.concat([
      {
        dataIndex: 'type',
        title: 'Тип',
        render: type => typeNames[type],
      },
    ]);
    return (
      <div>
        <AddPage pageCreator={client.pageCreator} related={false} />
        <Spin spinning={spinning}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={client.pagesData}
            size="small"
            pagination={false}
            title={() => 'Список страниц клиента'}
            footer={() => `Всего просмотров: ${client.totalViews}`}
            expandedRowRender={this.expandedRowRender}
          />
        </Spin>
      </div>
    );
  }
}

export default PageList;
