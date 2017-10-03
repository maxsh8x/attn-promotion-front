import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Input, Button } from 'antd';
import style from './AddPage.css';


@inject('promotionStore') @observer
class AddPage extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.updateURL = this.updateURL.bind(this);
    this.createPage = this.createPage.bind(this);
  }

  updateURL(e) {
    this.props.promotionStore.updateInput(
      'url',
      e.target.value,
    );
  }

  createPage() {
    this.props.promotionStore.createPage();
  }

  render() {
    return (
      <span>
        <Input
          placeholder="Адрес страницы"
          className={style.test}
          onChange={this.updateURL}
          disabled={this.props.promotionStore.states.createPage !== 'success'}
        />
        <Button
          type="primary"
          icon="plus"
          onClick={this.createPage}
          loading={this.props.promotionStore.states.createPage !== 'success'}
        />
      </span>
    );
  }
}

export default AddPage;
