import React from 'react';
import { observer } from 'mobx-react';
import { Table, InputNumber } from 'antd';


const InputCost = ({ page }) => {
  const { inputDataDay, commitInput, setInput } = page;
  const networks = page.store.sources;
  const childItems = networks.map(network => (
    {
      title: network[0].toUpperCase() + network.substr(1),
      children: [
        {
          key: `${network}.clicks`,
          title: 'Кликов',
          dataIndex: `${network}.clicks`,
          render: value => (
            <InputNumber
              step={1}
              min={0}
              value={value}
              onBlur={e => commitInput(network, 'clicks', e.target.value)}
              onChange={nextValue => setInput(network, 'clicks', nextValue)}
            />),
        },
        {
          key: `${network}.cost`,
          title: 'Потрачено',
          dataIndex: `${network}.cost`,
          render: value => (
            <InputNumber
              step={0.01}
              min={0}
              value={value}
              onBlur={e => commitInput(network, 'cost', e.target.value)}
              onChange={nextValue => setInput(network, 'cost', nextValue)}
            />),
        },
      ],
    }
  ));
  const columns = [
    {
      title: 'Ввод данных',
      children: childItems,
    },
  ];
  return (
    <Table
      bordered
      rowKey="id"
      columns={columns}
      dataSource={inputDataDay}
      size="small"
      pagination={false}
    />
  );
};

InputCost.propTypes = {

};

export default observer(InputCost);
