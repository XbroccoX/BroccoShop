import axios from 'axios';

const oasisApi = axios.create({
    baseURL: '/api'
})

export default oasisApi;