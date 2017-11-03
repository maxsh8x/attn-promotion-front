import React, { Component } from 'react';
import moment from 'moment';
import { Table, Button, Modal, Spin, Tabs, Icon, Radio } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import ClientsList from './ClientsList';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';
import ViewsPeriod from '../ViewsPeriod';


@inject('questionStore') @observer
class QuestionsList extends Component {
  componentWillMount() {
    this.props.questionStore.fetchQuestions();
  }

  setPagination = ({ current, pageSize }) =>
    this.props.questionStore.setPagination(current, pageSize);

  expandedRowRender = (row, rowIndex) => {
    const groupQuestion = this.props.questionStore.questions[rowIndex];
    return <ClientsList groupQuestion={groupQuestion} />;
  }

  footer = () => {
    const {
      startDate,
      endDate,
      setDate,
    } = this.props.questionStore;
    return (
      <ViewsPeriod
        startDate={startDate}
        endDate={endDate}
        setDate={setDate}
      />
    );
  }

  renderPageURL = (title, { url }) =>
    (<a href={answerURL + url}>
      <TextWithDots text={title} length={100} />
    </a>);

  renderExtraActions = (
    <Radio.Group defaultValue="folded">
      <Radio.Button value="folded">Свернутый</Radio.Button>
      <Radio.Button value="unfolded">Развернутый</Radio.Button>
    </Radio.Group>
  );


  render() {
    const {
      groupQuestionCreator,
      questionsData,
      switchTab,
      state,
      current,
      pageSize,
      total,
    } = this.props.questionStore;

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
        <Spin spinning={state === 'pending'}>
          <Tabs
            defaultActiveKey="group"
            tabBarExtraContent={this.renderExtraActions}
            onChange={switchTab}
          >
            <Tabs.TabPane tab={<span><Icon type="team" />Групповые</span>} key="group">
              {permissions(['root']) &&
                <div className={style.tableOperations}>
                  <Button
                    onClick={groupQuestionCreator.toggleModal}
                  >
                    Создать групповой вопрос
                  </Button>
                </div>
              }
              <Table
                bordered
                rowKey="id"
                columns={columns}
                dataSource={questionsData}
                title={() => 'Список групповых вопросов'}
                expandedRowRender={this.expandedRowRender}
                onChange={this.setPagination}
                pagination={paginationParams}
                footer={this.footer}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><Icon type="user" />Индивидуальные</span>} key="individual">
              <Table
                bordered
                rowKey="id"
                columns={columns}
                dataSource={questionsData}
                title={() => 'Список индивидуальных вопросов'}
                expandedRowRender={this.expandedRowRender}
                onChange={this.setPagination}
                pagination={paginationParams}
                footer={this.footer}
              />
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }
}

QuestionsList.propTypes = {

};

export default QuestionsList;
