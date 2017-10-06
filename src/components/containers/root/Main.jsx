import React from 'react';
import { Route } from 'react-router-dom';
import ClientsList from '../ClientsList/Main';
import PromotionList from '../PromotionList/Main';


const RootArea = () => (
  <div>
    <Route path="/clients" component={ClientsList} />
    <Route path="/promotion" component={PromotionList} />
  </div>
);

export default RootArea;
