import React, { Component } from 'react';
import moment from 'moment';
import { Table, Button, Modal, DatePicker, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import ClientsList from './ClientsList';
import style from './Main.css';
import permissions from '../../../utils/permissions';
import { answerURL } from '../../../constants';

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

  render() {
    const {
      groupQuestionCreator,
      groupQuestionsData,
      startDate,
      endDate,
      setDate,
      state
    } = this.props.groupQuestionStore;

    const columns = [
      {
        dataIndex: 'title',
        title: 'Название',
        render: (title, { url }) => <a href={answerURL + url}>{title}</a>,
      },
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
        {permissions(['root']) &&
          <div className={style.tableOperations}>
            <Button
              onClick={groupQuestionCreator.toggleModal}
            >
              Создать групповой вопрос
            </Button>
          </div>
        }
        <Spin spinning={state === 'pending'}>
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
        </Spin>
      </div>
    );
  }
}

GroupQuestionsList.propTypes = {

};

export default GroupQuestionsList;
