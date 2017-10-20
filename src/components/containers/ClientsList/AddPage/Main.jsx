import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import style from './Main.css';
import TypeSelector from './TypeSelector';
import Individual from './Individual';
import Group from './Group';

const AddPage = ({ pageCreator }) => (
  <div className={style.tableOperations}>
    <TypeSelector value={pageCreator.type} onChange={pageCreator.setType} />
    {
      pageCreator.type === 'group'
        ? <Group />
        : <Individual />
    }
  </div>
);

AddPage.propTypes = {

};

export default observer(AddPage);
