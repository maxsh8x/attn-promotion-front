import React from 'react';
import { Card } from 'antd';
import { observer } from 'mobx-react';
import InputCost from './InputCost';
import YandexMetrics from './YandexMetrics';
import PromotionChart from './PromotionChart';
import ClientsList from './ClientsList';

const PageLayout = ({ page, date }) => (
  <div>
    <Card noHovering>
      <ClientsList page={page} />
    </Card>
    <Card noHovering>
      <InputCost page={page} />
    </Card>
    <Card noHovering>
      <YandexMetrics page={page} key={page + date} />
    </Card>
    <Card noHovering>
      <PromotionChart chart={page.chart} />
    </Card>
  </div>
);

PageLayout.propTypes = {

};

export default observer(PageLayout);
