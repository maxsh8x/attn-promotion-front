import { reaction } from 'mobx';
import { types, getEnv } from 'mobx-state-tree';
import debounce from 'lodash.debounce';

const Page = types
  .model({
    filter: types.string,
  })
  .views(self => ({
    get fetchPages() {
      return getEnv(self).fetchPages;
    },
  }))
  .actions(self => ({
    afterCreate() {
      reaction(
        () => self.filter,
        () => debounce(self.fetchPages(), 800),
      );
    },
    setFilter(value) {
      self.filter = value;
    },
  }));

const Client = types
  .model({
    id: types.identifier(types.number),
    name: types.string,
  });

const ClientFilter = types
  .model({
    value: types.string,
    data: types.optional(types.map(Client), {}),
  })
  .views(self => ({
    get fetchClients() {
      return getEnv(self).fetchClients;
    },
  }))
  .actions(self => ({
    afterCreate() {

    },
    onChange() {
      
    },
  }));

const FilterStore = types
  .model({
    page: types.optional(Page, {}),
    client: types.optional(ClientFilter, {}),
  });

export default FilterStore;
