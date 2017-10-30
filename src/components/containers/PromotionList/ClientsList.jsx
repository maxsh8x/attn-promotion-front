import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tag } from 'antd';

@observer
class ClientsList extends Component {
  componentWillMount() {
    this.props.page.fetchClientsNames();
  }

  render() {
    const { clientsNamesData } = this.props.page;
    return (
      <div>
        {
          clientsNamesData.length > 0
            ? <h4 style={{ marginBottom: 16 }}>Клиенты: </h4>
            : <h4>Клиенты не привязаны</h4>
        }
        {
          clientsNamesData.map(name => <Tag>{name}</Tag>)
        }
      </div>
    );
  }
}

ClientsList.propTypes = {

};

export default ClientsList;
