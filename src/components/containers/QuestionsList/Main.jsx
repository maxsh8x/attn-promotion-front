import React, { Component } from 'react';
import moment from 'moment';
import { Table, Modal, Tabs, Icon, Radio } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import ClientsList from './ClientsList';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';
import Period from '../Period';
import InfoBadges from '../InfoBadges';
import BindClient from './BindClient';


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
    <div style={{ float: 'right' }}>
      <InfoBadges />
    </div>
  </div>
);

@inject('questionStore') @observer
class QuestionsList extends Component {
  componentWillMount() {
    this.props.questionStore.fetchData();
  }

  expandedRowRender = (row, rowIndex) => {
    const { questions, settings } = this.props.questionStore;
    const groupQuestion = questions[rowIndex];
    return (
      <ClientsList
        groupQuestion={groupQuestion}
      />
    );
  }

  renderPageURL = (title, { url }) =>
    (<a href={answerURL + url}>
      <TextWithDots text={title} length={100} />
    </a>);

  renderActions = (value, { id }) => (
    <span>
      <a
        role="button"
        tabIndex={0}
        onClick={
          () => this.props.questionStore.clientsBinder.toggleModal(id)
        }
      >
        Привязать клиентов
      </a>
    </span>
  );

  render() {
    const availableColumns = [
      {
        key: 'title',
        dataIndex: 'title',
        title: 'Название',
        render: this.renderPageURL,
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        title: 'Дата создания',
        render: value => moment(value).format('YYYY-MM-DD'),
      },
    ];

    if (permissions(['root', 'buchhalter'])) {
      availableColumns.push({
        key: 'views',
        dataIndex: 'views',
        title: 'Просмотров',
      });
    }

    if (permissions(['root', 'manager'])) {
      availableColumns.push(
        {
          key: 'actions',
          title: 'Действия',
          render: this.renderActions,
        },
      );
    }

    const {
      groupQuestionCreator,
      questionsData,
      switchTab,
      tableType,
      setTableType,
      state,
      settings,
      startDate,
      endDate,
      setDate,
      clientsBinder,
    } = this.props.questionStore;
    const {
      current,
      total,
      pageSize,
      setPagination,
    } = settings;

    const columns = availableColumns.filter(
      column => settings.columns.indexOf(column.key) !== -1,
    );

    const renderExtraActions = (
      <div className={style.headerOperations}>
        {permissions(['root', 'buchhalter']) && <Period
          startDate={startDate}
          endDate={endDate}
          setDate={setDate}
          label="Подсчет просмотров за период"
        />}
        <Radio.Group
          value={settings.tableType}
          onChange={(e) => {
            settings.setFolding(e.target.value);
          }}
        >
          <Radio.Button value="unfolded">Развернутый</Radio.Button>
          <Radio.Button value="folded">Свернутый</Radio.Button>
        </Radio.Group>
      </div>
    );

    const standartProps = {
      expandedRowRender: this.expandedRowRender,
      onChange: setPagination,
      pagination: {
        pageSize,
        current,
        total,
      },
      loading: state === 'pending',
      dataSource: questionsData,
      bordered: true,
      rowKey: 'id',
      columns,
    };

    if (settings.tableType === 'unfolded') {
      standartProps.expandedRowKeys = questionsData.map(row => row.id);
    }

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
        <Modal
          visible={clientsBinder.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={() => clientsBinder.toggleModal()}
        >
          <BindClient clientsBinder={clientsBinder} />
        </Modal>
        <Tabs
          defaultActiveKey="group"
          tabBarExtraContent={renderExtraActions}
          onChange={switchTab}
        >
          <Tabs.TabPane tab={<span><Icon type="team" />Групповые</span>} key="group">
            <Table
              {...standartProps}
              title={() => (
                <Header
                  title="Список групповых вопросов"
                  onCreateClick={groupQuestionCreator.toggleModal}
                />
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span><Icon type="user" />Индивидуальные</span>} key="individual">
            <Table
              {...standartProps}
              title={() => 'Список индивидуальных вопросов'}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

QuestionsList.propTypes = {

};

export default QuestionsList;
