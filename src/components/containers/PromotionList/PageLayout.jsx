import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { observer } from 'mobx-react';

const PageLayout = ({ pageID, rowIndex }) => {
  return (
    <div>
      <Card noHovering>
        {/* <InputCost pageID={pageID} rowIndex={rowIndex} /> */}
      </Card>
      <Card noHovering>
        {/* <YandexMetrics pageID={pageID} rowIndex={rowIndex} /> */}
      </Card>
      <Card noHovering>
        {/* <PromotionChart /> */}
      </Card>
    </div>
  );
};

PageLayout.propTypes = {

};

export default observer(PageLayout);
