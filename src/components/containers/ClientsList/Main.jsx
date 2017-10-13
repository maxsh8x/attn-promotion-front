import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button, Modal, Form, Input } from 'antd';
import PageList from './PageList';
import style from './Main.css';

@inject('clientsStore') @observer
class ClientsList extends Component {
  componentDidMount() {
    this.props.clientsStore.fetchClients();
  }

  expandedRowRender = ({ id }) => {
    const client = this.props.clientsStore.clients.get(id);
    return <PageList client={client} />;
  }

  render() {
    const { clients, clientsData, clientCreator } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'name', title: 'Имя клиента' },
      { title: 'Активных' },
      { title: 'Неактивных' },
    ];


    return (
      <div>
        <Modal
          visible={clientCreator.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={clientCreator.toggleModal}
        >
          <Form>
            <Form.Item>
              <Input
                placeholder="Название"
                name="name"
                value={clientCreator.name}
                onChange={e => clientCreator.setName(e.target.value)}
              />
            </Form.Item>
            <Button onClick={clientCreator.createClient}>Создать</Button>
          </Form>
        </Modal>
        <div className={style.tableOperations}>
          <Button onClick={clientCreator.toggleModal}>Создать клиента</Button>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={clientsData}
            title={() => 'Список клиентов'}
            expandedRowRender={this.expandedRowRender}
          />
        </div>
      </div>
    );
  }
}

export default ClientsList;
