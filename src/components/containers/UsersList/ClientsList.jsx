import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table } from 'antd';
import SearchFilter from '../SearchFilter';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.user.fetchClients();
  }

  render() {
    const { clientsData } = this.props.user;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
      { dataIndex: 'name', title: 'Имя клиента' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'vatin', title: 'ИНН' },
      { dataIndex: 'views', title: 'Просмотров' },
    ];

    return (
      <div>
        <div>
          <SearchFilter
            title="Введите имя клиента для поиска"
            url="/v1/client/search"
            width={300}
          />
        </div>
        <Table
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
