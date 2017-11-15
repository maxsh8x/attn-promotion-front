import React, { Component } from 'react';
import { Table } from 'antd';
import { observer } from 'mobx-react';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.page.fetchArchive();
  }

  render() {
    const { archiveData } = this.props.page;
    return (
      <div>
        <Table
          dataSource={archiveData}
          rowKey="id"
          size="small"
          pagination={false}
          title={() => 'Список архивных данных'}
        />
      </div>
    );
  }
}

ClientsList.propTypes = {

};

export default ClientsList;
