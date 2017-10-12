import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table } from 'antd';


@inject('clientsStore') @observer
class ClientPages extends Component {
  render() {
    return (
      <div>
        <Table />
      </div>
    );
  }
}

export default ClientPages;
