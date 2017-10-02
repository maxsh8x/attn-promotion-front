import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { InputNumber, Icon } from 'antd';
import style from './EditableCell.css';

@inject('promotionStore') @observer
class EditableCell extends React.Component {
  onBlur = (e) => {
    this.props.promotionStore.commitInputChanges({
      source: this.props.field,
      type: this.props.type,
      pageID: this.props.pageID,
      value: parseInt(e.target.value, 10),
    });
  }

  render() {
    return (
      <div className={style.editableCell}>
        {
          <div className={style.editableCellInputWrapper}>
            <InputNumber
              min={0}
              defaultValue={this.props.value || 0}
              onBlur={this.onBlur}
            />
          </div>
        }
      </div>
    );
  }
}

export default EditableCell;
