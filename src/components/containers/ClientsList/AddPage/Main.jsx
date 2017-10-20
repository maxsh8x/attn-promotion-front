import React from 'react';
import { observer } from 'mobx-react';
import { Button, Input } from 'antd';
import style from './Main.css';
import TypeSelector from './TypeSelector';
import Group from './Group';

const AddPage = ({ pageCreator }) => (
  <div className={style.tableOperations}>
    <TypeSelector value={pageCreator.type} onChange={pageCreator.setType} />
    {
      pageCreator.type === 'group'
        ? <Group />
        : <Input
          placeholder="Введите адрес страницы"
          onChange={e => pageCreator.setURL(e.target.value)}
          value={pageCreator.url}
          disabled={pageCreator.state === 'pending'}
          style={{ width: 250 }}
        />
    }
    <Button onClick={pageCreator.createPage}>Привязать</Button>
  </div>
);

AddPage.propTypes = {

};

export default observer(AddPage);
