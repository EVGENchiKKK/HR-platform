import axiosInstance from './axios';

const WORKSPACE_ENDPOINTS = {
  DATA: '/workspace/data'
};

export const getWorkspaceData = async () => {
  const response = await axiosInstance.get(WORKSPACE_ENDPOINTS.DATA);
  return response.data;
};

export const updateAppeal = async (appealId, payload) => {
  const response = await axiosInstance.put(`/workspace/appeals/${appealId}`, payload);
  return response.data;
};

export const sendAppealMessage = async (appealId, payload) => {
  const response = await axiosInstance.post(`/workspace/appeals/${appealId}/messages`, payload);
  return response.data;
};

export default {
  getWorkspaceData,
  updateAppeal,
  sendAppealMessage
};
