import apiClient from './apiClient';

export const tasksService = {
    createSprint: (payload) => apiClient.post('/sprints', payload),
    getSprint: (sprintId) => apiClient.get(`/sprints/${sprintId}`),

    // Create new task
    createTask: (payload) => apiClient.post('/tasks', payload),

    // List tasks (can filter by sprint_id via params)
    listTasks: (params) => apiClient.get('/tasks', { params }),

    // Update task (status, etc.)
    updateTask: (taskId, payload) => apiClient.put(`/tasks/${taskId}`, payload),

    // Delete task
    deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),

    // Get all tasks (convenience wrapper)
    getAllTasks: () => apiClient.get('/tasks'),

    // Get tasks by sprint (convenience wrapper)
    getSprintTasks: (sprintId) => apiClient.get('/tasks', { params: { sprint_id: sprintId } }),

    // Change status (convenience wrapper)
    changeStatus: (taskId, status) => apiClient.put(`/tasks/${taskId}`, { status }),
};

export default tasksService;
