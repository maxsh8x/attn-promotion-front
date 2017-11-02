import React from 'react';
import { Radio, Form } from 'antd';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const ControlBar = props => (
  <Form>
    <FormItem label="Вид таблицы:">
      <RadioGroup defaultValue="folded">
        <RadioButton value="folded">Свернутый</RadioButton>
        <RadioButton value="unfolded">Развернутый</RadioButton>
      </RadioGroup>
    </FormItem>
    <FormItem label="Подсчет просмотров по дате:">
      <RadioGroup defaultValue="table">
        <RadioButton value="table">Таблицы</RadioButton>
        <RadioButton value="question">Вопроса</RadioButton>
      </RadioGroup>
    </FormItem>
    <FormItem label="Показывать по типу:">
      <RadioGroup defaultValue="all">
        <RadioButton value="all">Все</RadioButton>
        <RadioButton value="individual">Индивидуальные</RadioButton>
        <RadioButton value="group">Групповые</RadioButton>
      </RadioGroup>
    </FormItem>
    <FormItem label="Плоскость:">
      <RadioGroup defaultValue="client">
        <RadioButton value="client">Клиент</RadioButton>
        <RadioButton value="question">Вопрос</RadioButton>
      </RadioGroup>
    </FormItem>
  </Form>
);

ControlBar.propTypes = {

};

export default ControlBar;
