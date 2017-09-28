import axios from 'axios';
import config from './config';

const getInstance = () => axios.create({
  baseURL: config.apiURL,
  headers: {
    Authorization: localStorage.getItem('token'),
  },
});

export default getInstance;
