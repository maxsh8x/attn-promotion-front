import React from 'react';
import { Tooltip } from 'antd';

const TextWithDots = ({ text, length }) => (
  <span>
    {text.substring(0, length)}
    {text.length > length && <Tooltip title={text}>...</Tooltip>}
  </span>
);

TextWithDots.propTypes = {

};

export default TextWithDots;
