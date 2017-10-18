import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import debounce from 'lodash.debounce';

import { Input } from 'antd';
import style from './ClientSelector.css';

@inject('promotionStore') @observer
class PageFilter extends Component {
  constructor(props) {
    super(props);
    this.fetchPages = debounce(this.fetchPages.bind(this), 800);
    this.updateFilter = this.updateFilter.bind(this);
  }

  fetchPages() {
    this.props.promotionStore.fetchPages();
  }

  updateFilter(e) {
    const filter = e.target.value;
    this.props.promotionStore.updateInput('filter', filter);
    this.fetchPages();
  }

  render() {
    const { filter } = this.props.promotionStore.inputData;
    return (
      <Input
        placeholder="Фильтр по названию страницы"
        className={style.inputField}
        value={filter}
        onChange={this.updateFilter}
      />
    );
  }
}

export default PageFilter;
