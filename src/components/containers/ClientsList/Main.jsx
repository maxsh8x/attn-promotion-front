import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';
import moment from 'moment';
import PageList from './PageList';
import style from './Main.css';

const { RangePicker } = DatePicker;

@inject('clientsStore') @observer
class ClientsList extends Component {
  componentDidMount() {
    this.props.clientsStore.fetchClients();
  }

  expandedRowRender = ({ id, type }) => {
    const client = this.props.clientsStore.clients.get(id);
    return <PageList client={client} type={type} />;
  }

  updateDate = (dates, [startDate, endDate]) => {
    this.props.clientsStore.setDate(startDate, endDate);
  }

  render() {
    const {
      clients,
      clientsData,
      clientCreator,
      startDate,
      endDate
    } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'name', title: 'Имя клиента' },
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
            footer={() => (
              <div>
                Подсчет просмотров за период: <RangePicker
                  defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
                  onChange={this.updateDate}
                />
              </div>)}
            expandedRowRender={this.expandedRowRender}
          />
        </div>
      </div>
    );
  }
}

export default ClientsList;
