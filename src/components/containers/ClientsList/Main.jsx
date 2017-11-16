import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, Radio, Tabs, Icon } from 'antd';
import PagesList from './PagesList';
import ClientCreator from './ClientCreator';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import Period from '../Period';
import InfoBadges from '../InfoBadges';
import AddPage from './AddPage';
import EditableCell from '../EditableCell';


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

@inject('clientsStore') @observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.clientsStore.fetchData();
  }

  expandedRowRender = ({ id, type }, rowIndex) => {
    const { clients, startDate, endDate } = this.props.clientsStore;
    const client = clients[rowIndex];
    return <PagesList dates={[startDate, endDate]} client={client} type={type} />;
  }

  renderActions = (value, { id }) => {
    return (
      <span>
        <a
          role="button"
          tabIndex={0}
          onClick={
            () => this.props.clientsStore.pageCreator.toggleModal(id)
          }
        >
          Создать страницу
        </a>
      </span>
    );
  }

  render() {
    const {
      clientsData,
      clientCreator,
      groupQuestionCreator,
      state,
      settings,
      startDate,
      endDate,
      setDate,
      activeTab,
      switchTab,
      pageCreator,
      commitInput
    } = this.props.clientsStore;
    const {
      current,
      total,
      pageSize,
      setPagination,
    } = settings;

    const renderExtraActions = (
      <div className={style.headerOperations}>
        {permissions(['root', 'buchhalter']) && <Period
          startDate={startDate}
          endDate={endDate}
          setDate={setDate}
          label="Подсчет просмотров за период"
        />
        }
        <Radio.Group
          value={settings.tableType}
          onChange={(e) => {
            settings.setFolding(e.target.value);
          }}
        >
          <Radio.Button value="folded">Свернутый</Radio.Button>
          <Radio.Button value="unfolded">Развернутый</Radio.Button>
        </Radio.Group>
      </div>
    );

    const columns = [
      {
        key: 'counterID',
        dataIndex: 'counterID',
        title: 'ID счетчика',
        width: 100,
      },
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Имя клиента',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'name', value)}
          />
        ),
      },
      {
        key: 'brand',
        dataIndex: 'brand',
        title: 'Бренд',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'brand', value)}
          />
        ),
      },
      {
        key: 'vatin',
        dataIndex: 'vatin',
        title: 'ИНН',
        width: 250,
        render: (text, { id }) => (
          <EditableCell
            value={text}
            onChange={value => commitInput(id, 'vatin', value)}
          />
        ),
      },

    ];

    if (permissions(['root', 'buchhalter'])) {
      columns.push(...[
        {
          key: 'period',
          title: 'За выбранный период',
          children: [
            {
              key: 'viewsPeriod',
              dataIndex: 'views',
              title: 'Просмотров',
              width: 250,
            },
            {
              key: 'costPeriod',
              dataIndex: 'cost',
              title: 'Стоимость',
              width: 250,
            },
          ],
        },
      ]);
    }

    if (permissions(['root'])) {
      columns.push({
        key: 'actions',
        title: 'Действия',
        render: this.renderActions,
        width: 250,
      });
    }

    const standartProps = {
      loading: state === 'pending',
      bordered: true,
      rowKey: 'id',
      dataSource: clientsData,
      title: () => 'Список клиентов',
      footer: this.footer,
      onChange: setPagination,
      expandedRowRender: this.expandedRowRender,
      pagination: {
        pageSize,
        current,
        total,
      },
      columns,
    };

    if (settings.tableType === 'unfolded') {
      standartProps.expandedRowKeys = clientsData.map(row => row.id);
    }

    return (
      <div>
        <Modal
          visible={clientCreator.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={clientCreator.toggleModal}
        >
          <ClientCreator clientCreator={clientCreator} />
        </Modal>
        <Modal
          visible={pageCreator.modalShown}
          title="Информация о странице"
          footer={null}
          onCancel={() => pageCreator.toggleModal()}
        >
          <AddPage creator={pageCreator} />
        </Modal>
        <Tabs
          value={activeTab}
          tabBarExtraContent={renderExtraActions}
          onChange={switchTab}
        >
          <Tabs.TabPane tab={<span><Icon type="star-o" />Все</span>} key="all">
            <Table
              {...standartProps}
              title={() => (
                <Header
                  title="Список клиентов"
                  onCreateClick={clientCreator.toggleModal}
                />
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span><Icon type="team" />Групповые</span>} key="group">
            <Table
              {...standartProps}
              title={() => (
                <Header
                  title="Список клиентов с групповыми вопросами"
                  onCreateClick={clientCreator.toggleModal}
                />
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span><Icon type="user" />Индивидуальные</span>} key="individual">
            <Table
              {...standartProps}
              title={() => (
                <Header
                  title="Список клиентов с индивидуальными вопросами"
                  onCreateClick={clientCreator.toggleModal}
                />
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

export default ClientsList;
