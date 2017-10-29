import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table, Spin, Switch, Modal, Button, Badge } from 'antd';
import style from './PagesList.css';
import AddPage from './AddPage';
import InfoBadges from '../InfoBadges';
import permissions from '../../../utils/permissions';

const typeNames = {
  individual: 'Индивидуальный',
  group: 'Групповой',
};

@observer
class PagesList extends Component {
  constructor(props) {
    super(props);
    this.basicColumns = [
      {
        dataIndex: 'active',
        title: 'Статус',
        render: active => <Switch checked={active} />,
      },
      // {
      //   dataIndex: 'url',
      //   title: 'Адрес',
      //   render: this.renderPageURL,
      // },
      {
        dataIndex: 'title',
        title: 'Название',
        render: (title, { url }) => <a href={url}>{title}</a>,
      },
      {
        dataIndex: 'views',
        title: 'Просмотров',
      },
      {
        title: 'Дата',
        children: [
          { title: 'От', dataIndex: 'startDate', render: this.renderDate },
          { title: 'До', dataIndex: 'endDate', render: this.renderDate },
        ],
      },
      {
        title: 'Показы',
        children: [
          { title: 'Min', dataIndex: 'minViews', render: this.renderViews },
          { title: 'Max', dataIndex: 'maxViews', render: this.renderViews },
        ],
      },
    ];
  }

  componentWillMount() {
    this.props.client.fetchPages();
  }

  expandedRowRender = ({ id, type }) => {
    if (type === 'group') {
      const { client } = this.props;
      const page = client.findPageById(id);
      return (
        <div>
          <Table
            rowKey="id"
            columns={this.basicColumns}
            dataSource={page.pagesData}
            size="small"
            pagination={false}
            title={() => 'Список страниц группового вопроса'}
          />
        </div>
      );
    }
    return null;
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>;
  };

  renderDate = value => moment(value).format('YYYY-MM-DD')

  renderViews = (value, { views }) => {
    const badgeStyle = value <= views
      ? { backgroundColor: '#87d068' }
      : {};
    return (<Badge
      count={value}
      style={badgeStyle}
      overflowCount={99999999}
      showZero
    />);
  }

  renderRowClassName = (now, { startDate, endDate }) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (start <= now && now <= end) {
      return style.rowStarted;
    } else if (start > now) {
      return style.rowWaited;
    }
    return style.rowDone;
  }

  render() {
    const { client } = this.props;
    const spinning = !(client.fetchPagesState === 'done');

    const columns = this.basicColumns.concat([
      {
        dataIndex: 'type',
        title: 'Тип',
        render: type => typeNames[type],
      },
    ]);

    const now = new Date().getTime();
    return (
      <div>
        <Modal
          visible={client.pageCreator.modalShown}
          title="Информация о странице"
          footer={null}
          onCancel={client.pageCreator.toggleModal}
        >
          <AddPage creator={client.pageCreator} />
        </Modal>
        {permissions(['root']) &&
          <div className={style.tableOperations}>
            <Button onClick={client.pageCreator.toggleModal}>
              Создать индивидуальную страницу
            </Button>
          </div>}
        <Spin spinning={spinning}>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={client.pagesData}
            size="small"
            pagination={false}
            title={() => 'Список страниц клиента'}
            footer={() => <InfoBadges />}
            expandedRowRender={this.expandedRowRender}
            rowClassName={row => this.renderRowClassName(now, row)}
          />
        </Spin>
      </div>
    );
  }
}

export default PagesList;
