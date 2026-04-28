import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const login = (host, username, password) =>
  api.post('/auth/login', { host, username, password }).then((res) => res.data);

export const logout = () => api.post('/auth/logout').then((res) => res.data);

export const getStatus = () => api.get('/auth/status').then((res) => res.data);

export const getHistoryEvents = (routerIp) =>
  api.get('/history/events', { params: { routerIp } }).then((res) => res.data);

export const getHistoryIndications = (routerIp) =>
  api.get('/history/indications', { params: { routerIp } }).then((res) => res.data);