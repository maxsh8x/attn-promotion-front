import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Popconfirm } from 'antd';
import SearchFilter from '../SearchFilter';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import shallowCompare from '../../../utils/helper';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.user.fetchClients();
  }

  componentWillReceiveProps({ dates }) {
    if (!(shallowCompare(dates, this.props.dates))) {
      this.props.user.fetchClients();
    }
  }

  setPagination = ({ current, pageSize }) =>
    this.props.user.setPagination(current, pageSize);

  renderActions = (value, { name }, rowIndex) => {
    const client = this.props.user.clients[rowIndex];
    return (
      <span>
        <Popconfirm
          title={`Вы действительно хотите отвязать "${name}?"`}
          onConfirm={client.unbind}
        >
          <a role="button" tabIndex={0}>
            Отвязать
          </a>
        </Popconfirm>
      </span>
    );
  }

  render() {
    const {
      clientsData,
      clientsBinder,
      current,
      pageSize,
      total,
      state,
    } = this.props.user;
    const columns = [
      {
        dataIndex: 'counterID',
        title: 'ID счетчика',
        width: 100,
      },
      {
        dataIndex: 'name',
        title: 'Имя клиента',
      },
      {
        dataIndex: 'brand',
        title: 'Бренд',
      },
      {
        dataIndex: 'vatin',
        title: 'ИНН',
      },
      {
        dataIndex: 'views',
        title: 'Просмотров',
      },
    ];

    if (permissions(['root'])) {
      columns.push(
        { title: 'Действия', render: this.renderActions },
      );
    }

    const paginationParams = { current, pageSize, total };

    return (
      <div>
        {permissions(['root']) &&
          <div className={style.tableOperations}>
            <SearchFilter
              title="Выберите клиентов"
              url="/v1/client/search"
              width={300}
              callback={clientsBinder.setClients}
            />
            <Button onClick={clientsBinder.bind}>Привязать</Button>
          </div>
        }
        <Table
          loading={state === 'pending'}
          bordered
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={clientsData}
          onChange={this.setPagination}
          pagination={paginationParams}
        />
      </div>
    );
  }
}

ClientsList.propTypes = {

};

export default ClientsList;
