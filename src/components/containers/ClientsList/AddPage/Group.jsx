import React from 'react';
import { observer } from 'mobx-react';
import { Input, Button, Form } from 'antd';

const Individual = ({ pageCreator, related }) => (
  <Form>
    <Input
      placeholder="Адрес страницы"
      onChange={e => pageCreator.setURL(e.target.value)}
      value={pageCreator.url}
      disabled={pageCreator.state === 'pending'}
    />
    <Button
      type="primary"
      icon="plus"
      onClick={() => pageCreator.createPage(related)}
      loading={pageCreator.state === 'pending'}
    >
      Добавить
    </Button>
  </Form>
);

Individual.propTypes = {

};

export default observer(Individual);
