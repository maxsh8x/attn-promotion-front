import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal } from 'antd';
import UserCreator from './UserCreator';
import ClientsList from './ClientsList';
import EditableCell from '../EditableCell';
import Period from '../Period';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';

const roleLables = {
  root: 'Администратор',
  buchhalter: 'Бухгалтер',
  manager: 'Менеджер',
};

const Header = ({ title, onCreateClick }) => (
  <div className={style.headerOperations}>
    <span>{title}</span>
    {permissions(['root']) &&
      <span>
        (
        <a
          role="button"
          onClick={onCreateClick}
          tabIndex={0}
        >
          Создать
        </a>
        )
      </span>
    }
  </div>
);

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
      <Period
        startDate={startDate}
        endDate={endDate}
        setDate={setDate}
        label="Подсчет просмотров за период"
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
      commitInput,
    } = this.props.usersStore;
    const columns = [
      {
        dataIndex: 'username',
        title: 'Имя пользователя',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'username', value)}
          />
        ),
      },
      {
        dataIndex: 'name',
        title: 'Имя',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'name', value)}
          />
        ),
      },
      {
        dataIndex: 'email',
        title: 'Email',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'email', value)}
          />
        ),
      },
      {
        dataIndex: 'role',
        title: 'Роль',
        render: role => roleLables[role],
        width: 150,
      },
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
        <Table
          loading={state === 'pending'}
          bordered
          rowKey="id"
          columns={columns}
          dataSource={usersData}
          expandedRowRender={this.expandedRowRender}
          onChange={this.setPagination}
          pagination={paginationParams}
          footer={this.footer}
          title={() => (
            <Header
              title="Список пользователей"
              onCreateClick={userCreator.toggleModal}
            />
          )}
        />
      </div>
    );
  }
}

UsersList.propTypes = {

};

export default UsersList;
