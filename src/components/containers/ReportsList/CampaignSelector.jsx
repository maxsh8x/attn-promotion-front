import React from 'react';
import { Button, Icon } from 'antd';
import style from '../../../style.css';


const CampaignSelector = () => (
  <span>
    <Button.Group>
      <Button disabled>
        <Icon type="left" />
      </Button>
      <Button className={style.campaignDone}>
        2017-05-11 - 2017-06-20
      </Button>
      <Button>
        <Icon type="right" />
      </Button>
    </Button.Group>
  </span>
);

CampaignSelector.propTypes = {

};

export default CampaignSelector;