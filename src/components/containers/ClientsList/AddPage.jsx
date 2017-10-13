import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Input, Button } from 'antd';
import QuestionTypeSelector from './QuestionTypeSelector';
import style from './AddPage.css';

@inject('clientsStore') @observer
class AddPage extends Component {

  // <QuestionTypeSelector />
  render() {
    const { pageCreator } = this.props;
    return (
      <div className={style.tableOperations}>
        <Input
          placeholder="Адрес страницы"
          onChange={e => pageCreator.setURL(e.target.value)}
          value={pageCreator.url}
        />
        <Button
          type="primary"
          icon="plus"
          onClick={pageCreator.createPage}
        >
          Добавить
        </Button>
      </div>
    );
  }
}

export default AddPage;
