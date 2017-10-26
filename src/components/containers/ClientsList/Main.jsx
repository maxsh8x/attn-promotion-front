import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Button, Modal, DatePicker, Spin } from 'antd';
import moment from 'moment';
import PagesList from './PagesList';
import ClientCreator from './ClientCreator';
import style from './Main.css';
import SearchFilter from '../SearchFilter';

const { RangePicker } = DatePicker;

@inject('clientsStore') @observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.clientsStore.fetchClients();
  }

  expandedRowRender = ({ id, type }) => {
    const client = this.props.clientsStore.findClientById(id);
    return <PagesList client={client} type={type} />;
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
      state
    } = this.props.clientsStore;
    const columns = [
      { dataIndex: 'counterID', title: 'ID счетчика', width: 100 },
      { dataIndex: 'name', title: 'Имя клиента' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'vatin', title: 'ИНН' },
      { dataIndex: 'views', title: 'Просмотров' },
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
          {/* <SearchFilter
            title="Фильтр по адресу страницы"
            url="/v1/page/search"
          /> */}
        </div>
        <Spin spinning={state === 'pending'}>
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
                  allowClear={false}
                />
              </div>)}
            expandedRowRender={this.expandedRowRender}
          />
        </Spin>
      </div>
    );
  }
}

export default ClientsList;
