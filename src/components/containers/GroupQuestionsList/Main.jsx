import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import GroupQuestionCreator from './GroupQuestionCreator';
import style from './Main.css';

const GroupQuestionsList = ({ groupQuestionStore }) => (
  <div>
    <Modal
      visible={groupQuestionStore.groupQuestionCreator.modalShown}
      title="Информация о странице"
      footer={null}
      onCancel={groupQuestionStore.groupQuestionCreator.toggleModal}
    >
      <GroupQuestionCreator groupQuestionCreator={groupQuestionStore.groupQuestionCreator} />
    </Modal>
    <div className={style.tableOperations}>
      <Button
        onClick={groupQuestionStore.groupQuestionCreator.toggleModal}
      >
        Создать групповой вопрос
      </Button>
      <Table bordered />
    </div>
  </div>
);

GroupQuestionsList.propTypes = {

};

export default inject('groupQuestionStore')(observer(GroupQuestionsList));
