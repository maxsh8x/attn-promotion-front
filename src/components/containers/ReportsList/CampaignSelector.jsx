import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Icon } from 'antd';
// import style from '../../../style.css';

const formatDate = dateISO => moment(dateISO).format('YYYY-MM-DD');
const getLabel = selectedCampaign =>
  `${formatDate(selectedCampaign.startDate)} - ${formatDate(selectedCampaign.endDate)}`;

const CampaignSelector = ({ campaignSelector }) => (
  <span>
    <Button.Group>
      <Button
        disabled={!campaignSelector.oldestIsActive}
        onClick={campaignSelector.oldest}
      >
        <Icon type="left" />
      </Button>
      <Button>
        {
          campaignSelector.selectedCampaign
            ? getLabel(campaignSelector.selectedCampaign)
            : 'Нет данных'
        }
      </Button>
      <Button
        disabled={!campaignSelector.newestIsActive}
        onClick={campaignSelector.newest}
      >
        <Icon type="right" />
      </Button>
    </Button.Group>
  </span>
);

CampaignSelector.propTypes = {

};

export default observer(CampaignSelector);
