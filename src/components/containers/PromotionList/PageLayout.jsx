import React from 'react';
import { Card } from 'antd';
import { observer } from 'mobx-react';
import InputCost from './InputCost';
import YandexMetricsDay from './YandexMetricsDay';
import YandexMetricsPeriod from './YandexMetricsPeriod';
import PromotionChart from './PromotionChart';
import ClientsList from './ClientsList';
import style from '../../../style.css';


const PageLayout = ({ page, date }) => (
  <div className={style.cards} >
    <Card noHovering>
      <ClientsList page={page} />
    </Card>
    <Card noHovering>
      <InputCost page={page} />
    </Card>
    <Card noHovering>
      <YandexMetricsDay metricsWidgetDay={page.metricsWidgetDay} key={`${page.id}_${date}_day`} />
      <YandexMetricsPeriod metricsWidgetPeriod={page.metricsWidgetPeriod} key={`${page.id}_period`} />
    </Card>
    <Card noHovering>
      <PromotionChart chart={page.chart} />
    </Card>
  </div>
);

PageLayout.propTypes = {

};

export default observer(PageLayout);
