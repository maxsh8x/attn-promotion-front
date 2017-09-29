import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Input, Icon } from 'antd';
import style from './EditableCell.css';

class EditableCell extends React.Component {
  state = {
    value: this.props.value,
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  render() {
    const { value } = this.state;
    return (
      <div className={style.editableCell}>
        {
          <div className={style.editableCellInputWrapper}>
            <Input
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
            />
          </div>
        }
      </div>
    );
  }
}

export default EditableCell;
