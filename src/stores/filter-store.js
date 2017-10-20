// import { reaction } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
// import debounce from 'lodash.debounce';
import axios from '../utils/axios';

const fetchStates = ['pending', 'done', 'error'];

const Page = types
  .model({
    id: types.identifier(types.number),
    url: types.string,
  });

const PageFilterValue = types
  .model({
    key: '',
    label: '',
  });

const PageFilter = types
  .model({
    lastFetchID: 0,
    filter: types.optional(types.array(PageFilterValue), []),
    pages: types.optional(types.array(Page), []),
    state: types.optional(
      types.enumeration(fetchStates),
      'done',
    ),
  })
  .actions(self => ({
    setFilter(value) {
      self.filter.replace(value);
      self.pages.clear();
      self.state = 'pending';
    },
    fetchPages() {
      self.state = 'pending';
      axios().get('v1/page/search', {
        params: {
          filter: self.filter,
        },
      }).then(
        self.fetchPagesSuccess,
        self.fetchPagesError,
      );
    },
    fetchPagesSuccess({ data }) {
      self.pages.replace(data);
      self.state = 'done';
    },
    fetchPagesError() {
      self.state = 'error';
    },
  }));

// const Client = types
//   .model({
//     id: types.identifier(types.number),
//     name: types.string,
//   });

// const ClientFilter = types
//   .model({
//     filter: '',
//     clients: types.array(Client),
//     state: types.optional(
//       types.enumeration(fetchStates),
//       'done',
//     ),
//   })
//   .actions(self => ({
//   }));

// const FiltersStore = types
//   .model({
//     page: types.optional(PageFilter, {}),
//     client: types.optional(ClientFilter, {}),
//   });

export { PageFilter };
