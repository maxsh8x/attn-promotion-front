import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Button, Modal, DatePicker } from 'antd';
import moment from 'moment';
import UserCreator from './UserCreator';
import ClientsList from './ClientsList';
import style from './Main.css';
import permissions from '../../../utils/permissions';

const { RangePicker } = DatePicker;

const roleLables = {
  root: 'Администратор',
  buchhalter: 'Бухгалтер',
  manager: 'Менеджер',
};

@inject('usersStore') @observer
class UsersList extends Component {
  componentWillMount() {
    this.props.usersStore.fetchUsers();
  }

  expandedRowRender = ({ role }, rowIndex) => {
    if (role === 'manager') {
      const user = this.props.usersStore.users[rowIndex];
      return <ClientsList user={user} />;
    }
    return null;
  }

  render() {
    const { usersData, userCreator, startDate, endDate } = this.props.usersStore;
    const columns = [
      { dataIndex: 'username', title: 'Имя пользователя' },
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'email', title: 'Email' },
      { dataIndex: 'role', title: 'Роль', render: role => roleLables[role] },
    ];
    return (
      <div>
        <Modal
          visible={userCreator.modalShown}
          title="Информация о пользователе"
          footer={null}
          onCancel={userCreator.toggleModal}
        >
          <UserCreator creator={userCreator} />
        </Modal>
        {permissions(['root']) &&
          <div className={style.tableOperations}>
            <Button onClick={userCreator.toggleModal}>Создать пользователя</Button>
          </div>
        }
        <Table
          bordered
          rowKey="id"
          columns={columns}
          dataSource={usersData}
          expandedRowRender={this.expandedRowRender}
          footer={() => (
            <div>
              Подсчет просмотров за период: <RangePicker
                defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
                onChange={this.updateDate}
                allowClear={false}
              />
            </div>)}
        />
      </div>
    );
  }
}

UsersList.propTypes = {

};

export default UsersList;
