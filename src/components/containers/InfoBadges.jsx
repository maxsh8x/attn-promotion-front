import React from 'react';
import { Badge } from 'antd';
import style from '../../style.css';

const InfoBadges = () => (<div className={style.infoBadges}>
  <Badge status="warning" text="Не началось" />
  <Badge status="success" text="В процессе" />
  <Badge status="error" text="Окончено" />
</div>);

export default InfoBadges;
