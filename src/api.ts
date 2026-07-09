/**
 * CodeVault Client API wrappers
 */

const getHeaders = () => {
  const token = localStorage.getItem('codevault_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  async register(username: string, email: string, passwordPlain: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password: passwordPlain }),
    });
    const data = await handleResponse<{ user: any; token: string }>(res);
    localStorage.setItem('codevault_token', data.token);
    return data;
  },

  async login(usernameOrEmail: string, passwordPlain: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password: passwordPlain }),
    });
    const data = await handleResponse<{ user: any; token: string }>(res);
    localStorage.setItem('codevault_token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('codevault_token');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('codevault_token');
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    return handleResponse<{ user: any }>(res).then(data => data.user).catch(() => {
      localStorage.removeItem('codevault_token');
      return null;
    });
  },

  // Topics
  async getTopics() {
    const res = await fetch('/api/topics', { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getTopic(id: string) {
    const res = await fetch(`/api/topics/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  // Statistics & Dashboard Activity
  async getStats() {
    const res = await fetch('/api/stats', { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async getActivity() {
    const res = await fetch('/api/activity', { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  // Notes
  async getNotes(topicId?: string) {
    const url = topicId ? `/api/notes?topicId=${topicId}` : '/api/notes';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createNote(data: any) {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateNote(id: string, data: any) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteNote(id: string) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Templates
  async getTemplates(topicId?: string) {
    const url = topicId ? `/api/templates?topicId=${topicId}` : '/api/templates';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createTemplate(data: any) {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateTemplate(id: string, data: any) {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteTemplate(id: string) {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Snippets
  async getSnippets() {
    const res = await fetch('/api/snippets', { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createSnippet(data: any) {
    const res = await fetch('/api/snippets', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateSnippet(id: string, data: any) {
    const res = await fetch(`/api/snippets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteSnippet(id: string) {
    const res = await fetch(`/api/snippets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Problems
  async getProblems(topicId?: string) {
    const url = topicId ? `/api/problems?topicId=${topicId}` : '/api/problems';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createProblem(data: any) {
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateProblem(id: string, data: any) {
    const res = await fetch(`/api/problems/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteProblem(id: string) {
    const res = await fetch(`/api/problems/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Videos
  async getVideos(topicId?: string) {
    const url = topicId ? `/api/videos?topicId=${topicId}` : '/api/videos';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createVideo(data: any) {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateVideo(id: string, data: any) {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteVideo(id: string) {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Mistakes
  async getMistakes(problemId?: string) {
    const url = problemId ? `/api/mistakes?problemId=${problemId}` : '/api/mistakes';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createMistake(data: any) {
    const res = await fetch('/api/mistakes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateMistake(id: string, data: any) {
    const res = await fetch(`/api/mistakes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteMistake(id: string) {
    const res = await fetch(`/api/mistakes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Revisions
  async getRevisions(completed?: boolean) {
    const url = completed !== undefined ? `/api/revisions?completed=${completed}` : '/api/revisions';
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async createRevision(data: any) {
    const res = await fetch('/api/revisions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateRevision(id: string, data: any) {
    const res = await fetch(`/api/revisions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteRevision(id: string) {
    const res = await fetch(`/api/revisions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Bookmarks
  async getBookmarks() {
    const res = await fetch('/api/bookmarks', { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async toggleBookmark(itemType: 'topic' | 'note' | 'problem' | 'template', itemId: string) {
    const res = await fetch('/api/bookmarks/toggle', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ itemType, itemId }),
    });
    return handleResponse<{ bookmarked: boolean }>(res);
  },

  // General Search
  async searchEverything(query: string) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
    return handleResponse<{
      topics: any[];
      notes: any[];
      templates: any[];
      problems: any[];
      videos: any[];
    }>(res);
  },

  // Image Upload base64
  async uploadImage(name: string, type: string, base64: string) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, type, base64 }),
    });
    return handleResponse<{ url: string }>(res);
  },
};
