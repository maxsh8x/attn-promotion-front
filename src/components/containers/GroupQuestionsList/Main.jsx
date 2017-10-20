import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button, Modal, Popover } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import style from './Main.css';

@inject('groupQuestionStore') @observer
class GroupQuestionsList extends Component {
  componentWillMount() {
    this.props.groupQuestionStore.fetchGroupQuestions();
  }

  expandedRowRender = ({ id: pageID }) => {
    return (
      <div>
        {pageID}
      </div>
    );
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return (
      <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>
    );
  }


  render() {
    const { groupQuestionCreator, groupQuestionsData } = this.props.groupQuestionStore;

    const columns = [
      { dataIndex: 'url', title: 'Адрес', render: this.renderPageURL },
      { dataIndex: 'title', title: 'Название' },
      { dataIndex: 'createdAt', title: 'Дата создания', render: value => moment(value).format('YYYY-MM-DD') },
    ];

    return (
      <div>
        <Modal
          visible={groupQuestionCreator.modalShown}
          title="Информация о странице"
          footer={null}
          onCancel={groupQuestionCreator.toggleModal}
        >
          <GroupQuestionCreator groupQuestionCreator={groupQuestionCreator} />
        </Modal>
        <div className={style.tableOperations}>
          <Button
            onClick={groupQuestionCreator.toggleModal}
          >
            Создать групповой вопрос
          </Button>
          <Table
            bordered
            rowKey="id"
            columns={columns}
            dataSource={groupQuestionsData}
            title={() => 'Список групповых вопросов'}
            expandedRowRender={this.expandedRowRender}
          />
        </div>
      </div>
    );
  }
}

GroupQuestionsList.propTypes = {

};

export default GroupQuestionsList;
