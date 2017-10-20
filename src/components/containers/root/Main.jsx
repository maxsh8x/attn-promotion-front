import React from 'react';
import { Route } from 'react-router-dom';
import ClientsList from '../ClientsList/Main';
// import PromotionList from '../PromotionList/Main';
import GroupQuestionsList from '../GroupQuestionsList/Main';

/* <Route path="/promotion" component={PromotionList} /> */

const RootArea = () => (
  <div>
    <Route path="/clients" component={ClientsList} />
    <Route path="/group-questions" component={GroupQuestionsList} />
  </div>
);

export default RootArea;
