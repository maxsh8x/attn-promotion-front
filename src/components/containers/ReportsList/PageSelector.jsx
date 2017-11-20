import React from 'react';
import { Select } from 'antd';
import { observer } from 'mobx-react';

const PageSelector = ({ pageSelector: { pageID, setPage, pagesData } }) => (
  <Select
    showSearch
    style={{ width: 400 }}
    placeholder="Введите название страницы клиента"
    optionFilterProp="children"
    filterOption={
      (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    value={pageID ? `${pageID}` : null}
    onChange={setPage}
  >
    {
      pagesData.map(
        item => (<Select.Option
          key={item.id}
          value={`${item.id}`}
        >
          {item.title}
        </Select.Option>),
      )
    }
  </Select>
);

PageSelector.propTypes = {

};

export default observer(PageSelector);
