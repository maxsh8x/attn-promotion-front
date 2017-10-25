import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Modal, Table } from 'antd';
import BindClient from './BindClient';
import style from './ClientsList.css';

@observer
class QuestionList extends Component {
  componentWillMount() {
    this.props.groupQuestion.fetchClients();
  }

  renderDate = value => moment(value).format('YYYY-MM-DD')

  render() {
    const { clientsData, clientsBinder } = this.props.groupQuestion;
    const columns = [
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'vatin', title: 'Инн' },
      { dataIndex: 'brand', title: 'Бренд' },
      {
        title: 'Дата',
        children: [
          { title: 'От', dataIndex: 'startDate', render: this.renderDate },
          { title: 'До', dataIndex: 'endDate', render: this.renderDate },
        ],
      },
      {
        title: 'Показы',
        children: [
          { title: 'Min', dataIndex: 'minViews' },
          { title: 'Max', dataIndex: 'maxViews' },
        ],
      },
    ];

    return (
      <div>
        <Modal
          visible={clientsBinder.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={clientsBinder.toggleModal}
        >
          <BindClient clientsBinder={clientsBinder} />
        </Modal>
        <div className={style.tableOperations}>
          <Button onClick={clientsBinder.toggleModal}>Привязать клиентов</Button>
        </div>
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={clientsData}
          pagination={false}
        />
      </div>
    );
  }
}

QuestionList.propTypes = {

};

export default QuestionList;
