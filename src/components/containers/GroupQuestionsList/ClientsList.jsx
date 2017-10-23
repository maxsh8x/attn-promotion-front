import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Button, Modal, Table } from 'antd';
import SearchFilter from '../SearchFilter';
import BindClient from './BindClient';
import style from './ClientsList.css';

@observer
class QuestionList extends Component {
  componentWillMount() {
    this.props.groupQuestion.fetchClients();
  }

  render() {
    const { clientsData, clientsBinder } = this.props.groupQuestion;
    const columns = [
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'vatin', title: 'Инн' },
      { dataIndex: 'brand', title: 'Бренд' },
      { dataIndex: 'views', title: 'Просмотров' },
    ];

    return (
      <div>
        <Modal
          visible={clientsBinder.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={clientsBinder.toggleModal}
        >
          <BindClient />
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
