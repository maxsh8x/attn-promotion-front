import React from 'react';
import { observer } from 'mobx-react';
import { Form, Select, Radio } from 'antd';

const ShowHideItem = () => (
  <Radio.Group>
    <Radio.Button value="folded">Показывать</Radio.Button>
    <Radio.Button value="unfolded">Не показывать</Radio.Button>
  </Radio.Group>
);

const TableSettings = () => (
  <Form>
    <Form.Item
      label="Размер основной таблицы"
    >
      <Select defaultValue="10">
        <Select.Option value="10">10</Select.Option>
        <Select.Option value="50">50</Select.Option>
        <Select.Option value="100">100</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item
      label="Заголовок"
    >
      <ShowHideItem />
    </Form.Item>
    <Form.Item
      label="Режим"
    >
      <Radio.Group>
        <Radio.Button value="folded">Свернутый</Radio.Button>
        <Radio.Button value="unfolded">Развернутый</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item
      label="Обозначения"
    >
      <ShowHideItem />
    </Form.Item>
    <Form.Item
      label="Кнопки управления"
    >
      <ShowHideItem />
    </Form.Item>
    <Form.Item
      label="Размер вложенной таблицы"
    >
      <Select defaultValue="10">
        <Select.Option value="10">10</Select.Option>
        <Select.Option value="50">50</Select.Option>
        <Select.Option value="100">100</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item
      label="Пагинация вложенных таблиц"
    >
      <ShowHideItem />
    </Form.Item>
  </Form>
);
TableSettings.propTypes = {

};

export default observer(TableSettings);
