import React from 'react';
import { Route } from 'react-router-dom';
import PromotionList from '../PromotionList/Main';


const RootArea = () => (
  <div>
    <Route path="/promotion" component={PromotionList} />
  </div>
);

export default RootArea;
