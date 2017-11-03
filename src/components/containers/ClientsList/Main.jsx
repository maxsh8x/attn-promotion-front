import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Button, Modal, DatePicker, Spin } from 'antd';
import PagesList from './PagesList';
import ClientCreator from './ClientCreator';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import ViewsPeriod from '../ViewsPeriod';


@inject('clientsStore') @observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.clientsStore.fetchClients();
  }

  setPagination = ({ current, pageSize }) =>
    this.props.clientsStore.setPagination(current, pageSize);

  expandedRowRender = ({ id, type }, rowIndex) => {
    const { clients, startDate, endDate } = this.props.clientsStore;
    const client = clients[rowIndex];
    return <PagesList dates={[startDate, endDate]} client={client} type={type} />;
  }

  footer = () => {
    const {
      startDate,
      endDate,
      setDate,
    } = this.props.clientsStore;
    return (
      <ViewsPeriod
        startDate={startDate}
        endDate={endDate}
        setDate={setDate}
      />
    );
  }

  render() {
    const {
      clientsData,
      clientCreator,
      groupQuestionCreator,
      state,
      total,
      current,
      pageSize,
    } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
      { dataIndex: 'name', title: 'Имя клиента' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'vatin', title: 'ИНН' },
      { dataIndex: 'views', title: 'Просмотров' },
      { dataIndex: 'costPerClick', title: 'Цена за период', render: (costPerClick, { views }) => views * costPerClick },
    ];

    const paginationParams = { current, pageSize, total };

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
          {permissions(['root']) && <Button onClick={clientCreator.toggleModal}>Создать клиента</Button>}
        </div>
        <Spin spinning={state === 'pending'}>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={clientsData}
            title={() => 'Список клиентов'}
            footer={this.footer}
            onChange={this.setPagination}
            expandedRowRender={this.expandedRowRender}
            pagination={paginationParams}
          />
        </Spin>
      </div>
    );
  }
}

export default ClientsList;
