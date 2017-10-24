import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button, Modal, DatePicker } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import ClientsList from './ClientsList';
import style from './Main.css';

const { RangePicker } = DatePicker;

@inject('groupQuestionStore') @observer
class GroupQuestionsList extends Component {
  componentWillMount() {
    this.props.groupQuestionStore.fetchGroupQuestions();
  }

  expandedRowRender = (row, rowIndex) => {
    const groupQuestion = this.props.groupQuestionStore.groupQuestions[rowIndex];
    return <ClientsList groupQuestion={groupQuestion} />;
  }

  updateDate = (dates, [startDate, endDate]) => {
    this.props.groupQuestionStore.setDate(startDate, endDate);
  }

  renderPageURL = (pageURL) => {
    const urlParts = pageURL.split('/');
    return (
      <a href={pageURL}>{urlParts[urlParts.length - 2]}</a>
    );
  }


  render() {
    const {
      groupQuestionCreator,
      groupQuestionsData,
      startDate,
      endDate,
      setDate
    } = this.props.groupQuestionStore;

    const columns = [
      { dataIndex: 'url', title: 'Адрес', render: this.renderPageURL },
      { dataIndex: 'title', title: 'Название' },
      { dataIndex: 'createdAt', title: 'Дата создания', render: value => moment(value).format('YYYY-MM-DD') },
      { dataIndex: 'views', title: 'Просмотров' },
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
        </div>
        <Table
          bordered
          rowKey="id"
          columns={columns}
          dataSource={groupQuestionsData}
          title={() => 'Список групповых вопросов'}
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

GroupQuestionsList.propTypes = {

};

export default GroupQuestionsList;
