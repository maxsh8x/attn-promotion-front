import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button } from 'antd';
import SearchFilter from '../SearchFilter';
import style from './ClientsList.css';
import permissions from '../../../utils/permissions';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.user.fetchClients();
  }

  renderActions = (value, row, rowIndex) => {
    const client = this.props.user.clients[rowIndex];
    return (
      <Button
        type="primary"
        size="small"
        onClick={client.unbind}
      >
        Отвязать
      </Button>
    );
  }

  render() {
    const { clientsData, clientsBinder } = this.props.user;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
      { dataIndex: 'name', title: 'Имя клиента' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'vatin', title: 'ИНН' },
      { dataIndex: 'views', title: 'Просмотров' },
      { title: 'Действия', render: this.renderActions },
    ];

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
          bordered
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={clientsData}
          pagination={false}
        />
      </div>
    );
  }
}

ClientsList.propTypes = {

};

export default ClientsList;
