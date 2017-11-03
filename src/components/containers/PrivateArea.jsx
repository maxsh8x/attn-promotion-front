import React from 'react';
import { Route } from 'react-router-dom';
import ClientsList from './ClientsList/Main';
import PromotionList from './PromotionList/Main';
import QuestionsList from './QuestionsList/Main';
import UsersList from './UsersList/Main';

const PrivateArea = () => (
  <div>
    <Route path="/clients" component={ClientsList} />
    <Route path="/questions" component={QuestionsList} />
    <Route path="/promotion" component={PromotionList} />
    <Route path="/users" component={UsersList} />
  </div>
);

export default PrivateArea;
