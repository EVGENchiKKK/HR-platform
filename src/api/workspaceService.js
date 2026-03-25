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

export const createAppeal = async (payload) => {
  const response = await axiosInstance.post('/workspace/appeals', payload);
  return response.data;
};

export const createForumTopic = async (payload) => {
  const response = await axiosInstance.post('/workspace/forum/topics', payload);
  return response.data;
};

export const createForumPost = async (topicId, payload) => {
  const response = await axiosInstance.post(`/workspace/forum/topics/${topicId}/posts`, payload);
  return response.data;
};

export const sendAppealMessage = async (appealId, payload) => {
  const response = await axiosInstance.post(`/workspace/appeals/${appealId}/messages`, payload);
  return response.data;
};

export const submitSurvey = async (surveyId, payload) => {
  const response = await axiosInstance.post(`/workspace/surveys/${surveyId}/submit`, payload);
  return response.data;
};

export const startCourse = async (courseId) => {
  const response = await axiosInstance.post(`/workspace/courses/${courseId}/start`);
  return response.data;
};

export const advanceCourseProgress = async (courseId) => {
  const response = await axiosInstance.post(`/workspace/courses/${courseId}/progress`);
  return response.data;
};

export default {
  getWorkspaceData,
  createAppeal,
  createForumTopic,
  createForumPost,
  updateAppeal,
  sendAppealMessage,
  submitSurvey,
  startCourse,
  advanceCourseProgress
};
