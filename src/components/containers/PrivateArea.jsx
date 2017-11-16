import React from 'react';
import Loadable from 'react-loadable';
import { Route } from 'react-router-dom';
import { Spin } from 'antd';

const loading = () => <Spin tip="Загрузка..." />;

const ClientsListAsync = Loadable({
  loader: () => import('./ClientsList/Main'),
  loading,
});

const PromotionListAsync = Loadable({
  loader: () => import('./PromotionList/Main'),
  loading,
});
const QuestionsListAsync = Loadable({
  loader: () => import('./QuestionsList/Main'),
  loading,
});
const UsersListAsync = Loadable({
  loader: () => import('./UsersList/Main'),
  loading,
});

const PrivateArea = () => (
  <div>
    <Route path="/clients" component={ClientsListAsync} />
    <Route path="/questions" component={QuestionsListAsync} />
    <Route path="/promotion" component={PromotionListAsync} />
    <Route path="/users" component={UsersListAsync} />
  </div>
);

export default PrivateArea;
