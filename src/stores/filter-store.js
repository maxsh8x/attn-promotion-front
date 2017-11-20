import { toJS } from 'mobx';
import { types } from 'mobx-state-tree';
import { message } from 'antd';
import axios from '../utils/axios';
import { fetchStates } from '../constants';

const Page = types
  .model({
    text: types.string,
    value: types.string,
  });

const FilterValue = types
  .model({
    key: types.string,
    label: types.string,
  });

const Filter = types
  .model('Filter', {
    lastFetchID: 0,
    url: types.string,
    length: types.number,
    items: types.optional(types.array(FilterValue), []),
    data: types.optional(types.array(Page), []),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .views(self => ({
    get itemsData() {
      return toJS(self.items);
    },
  }))
  .actions(self => ({
    setFilter(rawItems) {
      const items = rawItems.slice(0, self.length);
      self.items.replace(items);
      self.data.clear();
      self.state = 'done';
    },
    fetchData(filter) {
      self.state = 'pending';
      self.lastFetchID += 1;
      const fetchID = self.lastFetchID;
      axios().get(self.url, {
        params: {
          filter,
          limit: 5,
        },
      }).then(
        ({ data }) => self.fetchDataSuccess({ data, fetchID }),
        self.fetchDataError,
      );
    },
    fetchDataSuccess({ data, fetchID }) {
      if (fetchID !== self.lastFetchID) {
        return;
      }
      const newData = data.map(item => ({
        text: item.text,
        value: `${item.value}`,
      }));
      self.data.replace(newData);
      self.state = 'done';
    },
    fetchDataError() {
      message.error('Ошибка при получении данных');
      self.state = 'error';
    },
  }));

export default Filter;
