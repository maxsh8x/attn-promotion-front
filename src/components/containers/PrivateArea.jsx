import React from 'react';
import universal from 'react-universal-component';
import { Route } from 'react-router-dom';

const ClientsListAsync = universal(() => import('./ClientsList/Main'));

const PromotionListAsync = universal(() => import('./PromotionList/Main.jsx'));

const ReportsListAsync = universal(() => import('./ReportsList/Main'));

const QuestionsListAsync = universal(() => import('./QuestionsList/Main'));

const UsersListAsync = universal(() => import('./UsersList/Main'));

const PrivateArea = () => (
  <div>
    <Route path="/clients" component={ClientsListAsync} />
    <Route path="/questions" component={QuestionsListAsync} />
    <Route path="/promotion" component={PromotionListAsync} />
    <Route path="/reports" component={ReportsListAsync} />
    <Route path="/users" component={UsersListAsync} />
  </div>
);

export default PrivateArea;
