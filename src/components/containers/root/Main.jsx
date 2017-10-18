import React from 'react';
import { Route } from 'react-router-dom';
import ClientsList from '../ClientsList/Main';
import PromotionList from '../PromotionList/Main';
import GroupQuestionsList from '../GroupQuestionsList/Main';


const RootArea = () => (
  <div>
    <Route path="/clients" component={ClientsList} />
    <Route path="/promotion" component={PromotionList} />
    <Route path="/group-questions" component={GroupQuestionsList} />
  </div>
);

export default RootArea;
