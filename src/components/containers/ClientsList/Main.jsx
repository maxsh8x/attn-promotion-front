import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Button, Modal, DatePicker, Input } from 'antd';
import moment from 'moment';
import PageList from './PageList';
import ClientCreator from './ClientCreator';
import style from './Main.css';

const { RangePicker } = DatePicker;

@inject('clientsStore') @observer
class ClientsList extends Component {
  expandedRowRender = ({ id, type }) => {
    const client = this.props.clientsStore.clients.get(id);
    return <PageList client={client} type={type} />;
  }

  updateDate = (dates, [startDate, endDate]) => {
    this.props.clientsStore.setDate(startDate, endDate);
  }

  render() {
    const {
      clientsData,
      clientCreator,
      groupQuestionCreator,
      startDate,
      endDate,
    } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
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
          <ClientCreator clientCreator={clientCreator} />
        </Modal>
        <div className={style.tableOperations}>
          <Button onClick={clientCreator.toggleModal}>Создать клиента</Button>
          <Input placeholder="Фильтр по адресу страницы" name="url" style={{ width: 400 }} />
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
