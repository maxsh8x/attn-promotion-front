import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Input, Button } from 'antd';
import style from './AddPage.css';


@inject('clientsStore') @observer
class AddPage extends Component {
  static propTypes = {
    clientsStore: ReactPropTypes.shape({
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.updateURL = this.updateURL.bind(this);
    this.createPage = this.createPage.bind(this);
  }

  updateURL(e) {
    this.props.clientsStore.updateInput(
      'url',
      e.target.value,
    );
  }

  createPage() {
    const { clientID } = this.props;
    this.props.clientsStore.createPage(clientID);
  }

  render() {
    const disabled = this.props.clientsStore.states.createPage !== 'success';

    return (
      <div className={style.tableOperations}>
        <Input
          placeholder="Адрес страницы"
          onChange={this.updateURL}
          disabled={disabled}
        />
        <Button
          type="primary"
          icon="plus"
          onClick={this.createPage}
          loading={disabled}
        >
          Добавить
        </Button>
      </div>
    );
  }
}

export default AddPage;
