import React, { Component } from 'react';
import moment from 'moment';
import { Table, Button, Modal, DatePicker, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import ClientsList from './ClientsList';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';

const { RangePicker } = DatePicker;

@inject('groupQuestionStore') @observer
class GroupQuestionsList extends Component {
  componentWillMount() {
    this.props.groupQuestionStore.fetchGroupQuestions();
  }

  setPagination = ({ current, pageSize }) =>
    this.props.groupQuestionStore.setPagination(current, pageSize);

  expandedRowRender = (row, rowIndex) => {
    const groupQuestion = this.props.groupQuestionStore.groupQuestions[rowIndex];
    return <ClientsList groupQuestion={groupQuestion} />;
  }

  updateDate = (dates, [startDate, endDate]) => {
    this.props.groupQuestionStore.setDate(startDate, endDate);
  }

  renderPageURL = (title, { url }) =>
    (<a href={answerURL + url}>
      <TextWithDots text={title} length={100} />
    </a>);

  render() {
    const {
      groupQuestionCreator,
      groupQuestionsData,
      startDate,
      endDate,
      setDate,
      state,
      current,
      pageSize,
      total,
    } = this.props.groupQuestionStore;

    const paginationParams = { current, pageSize, total };

    const columns = [
      {
        dataIndex: 'title',
        title: 'Название',
        render: this.renderPageURL,
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
            onChange={this.setPagination}
            pagination={paginationParams}
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
