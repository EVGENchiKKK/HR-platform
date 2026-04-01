import axiosInstance from './axios';

const WORKSPACE_ENDPOINTS = {
  DATA: '/workspace/data'
};

export const getWorkspaceData = async () => {
  const response = await axiosInstance.get(WORKSPACE_ENDPOINTS.DATA);
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await axiosInstance.put('/workspace/notifications/read-all');
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

export const createTask = async (payload) => {
  const response = await axiosInstance.post('/workspace/tasks', payload);
  return response.data;
};

export const createDepartment = async (payload) => {
  const response = await axiosInstance.post('/workspace/departments', payload);
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await axiosInstance.post('/workspace/employees', payload);
  return response.data;
};

export const createTest = async (payload) => {
  const response = await axiosInstance.post('/workspace/tests', payload);
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await axiosInstance.put(`/workspace/tasks/${taskId}/complete`);
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
  markNotificationsRead,
  createAppeal,
  createForumTopic,
  createForumPost,
  createTask,
  createDepartment,
  createEmployee,
  createTest,
  completeTask,
  updateAppeal,
  sendAppealMessage,
  submitSurvey,
  startCourse,
  advanceCourseProgress
};
