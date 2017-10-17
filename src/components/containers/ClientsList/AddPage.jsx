import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Input, Button } from 'antd';
import style from './AddPage.css';

@observer
class AddPage extends Component {
  render() {
    const { pageCreator, parent, related } = this.props;
    const inProgress = pageCreator.state === 'pending';
    return (
      <div className={style.tableOperations}>
        <Input
          placeholder="Адрес страницы"
          onChange={e => pageCreator.setURL(e.target.value)}
          value={pageCreator.url}
          disabled={inProgress}
        />
        <Button
          type="primary"
          icon="plus"
          onClick={() => pageCreator.createPage(related, parent)}
          loading={inProgress}
        >
          Добавить
        </Button>
      </div>
    );
  }
}

export default AddPage;
