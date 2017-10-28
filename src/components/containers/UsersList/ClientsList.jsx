import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button } from 'antd';
import SearchFilter from '../SearchFilter';
import style from './ClientsList.css';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.user.fetchClients();
  }

  render() {
    const { clientsData, clientsBinder } = this.props.user;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
      { dataIndex: 'name', title: 'Имя клиента' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'vatin', title: 'ИНН' },
      { dataIndex: 'views', title: 'Просмотров' },
    ];

    return (
      <div>
        <div className={style.tableOperations}>
          <SearchFilter
            title="Выберите клиентов"
            url="/v1/client/search"
            width={300}
            callback={clientsBinder.setClients}
          />
          <Button onClick={clientsBinder.bind}>Привязать</Button>
        </div>
        <Table
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
