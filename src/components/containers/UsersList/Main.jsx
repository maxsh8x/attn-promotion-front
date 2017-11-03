import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Button, Modal, Spin } from 'antd';
import UserCreator from './UserCreator';
import ClientsList from './ClientsList';
import ViewsPeriod from '../ViewsPeriod';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';

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

  setPagination = ({ current, pageSize }) =>
    this.props.usersStore.setPagination(current, pageSize);

  expandedRowRender = ({ role }, rowIndex) => {
    if (role === 'manager') {
      const { users, startDate, endDate } = this.props.usersStore;
      const user = users[rowIndex];
      return <ClientsList dates={[startDate, endDate]} user={user} />;
    }
    return null;
  }

  footer = () => {
    const {
      startDate,
      endDate,
      setDate,
    } = this.props.usersStore;
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
      usersData,
      userCreator,
      state,
      current,
      pageSize,
      total,
    } = this.props.usersStore;
    const columns = [
      { dataIndex: 'username', title: 'Имя пользователя' },
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'email', title: 'Email' },
      { dataIndex: 'role', title: 'Роль', render: role => roleLables[role] },
    ];

    const paginationParams = { current, pageSize, total };
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
        <Spin spinning={state === 'pending'}>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={usersData}
            title={() => 'Список пользователей'}
            expandedRowRender={this.expandedRowRender}
            onChange={this.setPagination}
            pagination={paginationParams}
            footer={this.footer}
          />
        </Spin>
      </div>
    );
  }
}

UsersList.propTypes = {

};

export default UsersList;
