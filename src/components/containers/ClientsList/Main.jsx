import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button, Modal, Form, Input, Dropdown } from 'antd';
// import AddPage from './AddPage';
import PageList from './PageList';
import style from './Main.css';

@inject('clientsStore') @observer
class ClientsList extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    this.props.clientsStore.fetchClients();
  }

  toggleModal() {
    this.props.clientsStore.toggleModal();
  }

  updateInput(e, field) {
    this.props.clientsStore.updateInput(
      field || e.target.name,
      e.target.value,
    );
  }

  submit() {
    this.props.clientsStore.createClient();
  }

  expandedRowRender = ({ _id: clientID }) => {
    return (
      <div>
        <PageList clientID={clientID} />
      </div>
    );
  }

  render() {
    const { data, modalShown, inputData } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'name', title: 'Имя клиента' },
      { title: 'Активных' },
      { title: 'Неактивных' },
    ];

    return (
      <div>
        <Modal visible={modalShown} title="Информация о клиенте" footer={null} onCancel={this.toggleModal}>
          <Form>
            <Form.Item>
              <Input
                placeholder="Название"
                name="name"
                onChange={this.updateInput}
                value={inputData.name}
              />
            </Form.Item>
            <Button onClick={this.submit}>Создать</Button>
          </Form>
        </Modal>
        <div className={style.tableOperations}>
          <Button onClick={this.toggleModal}>Создать клиента</Button>
          <Table
            bordered
            rowKey="_id"
            columns={columns}
            dataSource={data.toJS()}
            title={() => 'Список клиентов'}
            expandedRowRender={this.expandedRowRender}
          />
        </div>
      </div>
    );
  }
}

export default ClientsList;
