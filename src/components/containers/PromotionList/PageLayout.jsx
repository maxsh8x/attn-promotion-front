import React from 'react';
import { Card } from 'antd';
import { observer } from 'mobx-react';
import InputCost from './InputCost';
import YandexMetrics from './YandexMetrics';
import PromotionChart from './PromotionChart';

const PageLayout = ({ page }) => (
  <div>
    <Card noHovering>
      <InputCost page={page} />
    </Card>
    <Card noHovering>
      <YandexMetrics page={page} />
    </Card>
    <Card noHovering>
      <PromotionChart chart={page.chart} />
    </Card>
  </div>
);

PageLayout.propTypes = {

};

export default observer(PageLayout);
