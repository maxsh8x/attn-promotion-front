import React, { Component } from 'react';
import { Input, Icon } from 'antd';
import style from '../../style.css';

class EditableCell extends Component {
  state = {
    value: this.props.value,
    editable: false,
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
  edit = () => {
    this.setState({ editable: true });
  }

  render() {
    const { value, editable } = this.state;
    return (
      <div className={style.editableCell}>
        {
          editable ?
            <div className={style.editableCellInputWrapper}>
              <Input
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className={style.editableCellIconCheck}
                onClick={this.check}
              />
            </div>
            :
            <div className={style.editableCellTextWrapper}>
              {value || ' '}
              <Icon
                type="edit"
                className={style.editableCellIcon}
                onClick={this.edit}
              />
            </div>
        }
      </div>
    );
  }
}

EditableCell.propTypes = {

};

export default EditableCell;
