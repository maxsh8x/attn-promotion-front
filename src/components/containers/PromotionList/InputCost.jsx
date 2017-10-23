import React from 'react';
import { observer } from 'mobx-react';
import { Table, InputNumber } from 'antd';


const InputCost = ({ page }) => {
  const networks = page.store.sources;
  const childItems = networks.map(network => (
    {
      title: network[0].toUpperCase() + network.substr(1),
      children: [
        {
          title: 'Кликов',
          dataIndex: `${network}.clicks`,
          render: value => (
            <InputNumber
              defaultValue={value}
              onBlur={e => page.commitInput(network, 'clicks', e.target.value)}
            />),
        },
        {
          title: 'Потрачено',
          dataIndex: `${network}.cost`,
          render: value => (
            <InputNumber
              defaultValue={value}
              onBlur={e => page.commitInput(network, 'cost', e.target.value)}
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
      rowKey="id"
      columns={columns}
      dataSource={page.inputData}
      size="small"
      pagination={false}
    />
  );
};

InputCost.propTypes = {

};

export default observer(InputCost);
