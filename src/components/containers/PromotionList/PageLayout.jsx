import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { observer } from 'mobx-react';
import InputCost from './InputCost';
import YandexMetrics from './YandexMetrics';

const PageLayout = ({ page }) => (
  <div>
    <Card noHovering>
      <InputCost page={page} />
    </Card>
    <Card noHovering>
      <YandexMetrics page={page} />
    </Card>
    <Card noHovering>
      {/* <PromotionChart /> */}
    </Card>
  </div>
);

PageLayout.propTypes = {

};

export default observer(PageLayout);
