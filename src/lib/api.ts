const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const authHeaders = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : {})

interface ApiError extends Error {
  status?: number
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const error: ApiError = new Error('Request failed')
    error.status = response.status
    try {
      const data = await response.json()
      if (data?.message) {
        error.message = data.message
      }
    } catch {
      // ignore parse errors
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export async function loginUser(email: string, password: string) {
  return apiRequest<{ user: { role: string; status: string; name?: string; email?: string; id?: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  )
}

export async function registerUser(payload: {
  email: string
  password: string
  name?: string
  phone?: string
  role: string
}) {
  return apiRequest<{ message: string }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function logoutUser() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}

export async function fetchMe(token?: string) {
  return apiRequest<{ user: { role: string; status: string; name?: string; email?: string; id?: string } }>('/auth/me', {
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function fetchUsers(token?: string) {
  return apiRequest<{ users: Array<{ id: string; email: string; name?: string; phone?: string; role: string; status: string; createdAt: string }> }>(
    '/admin/users',
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function updateUser(token?: string, id: string, payload: { status?: string; role?: string }) {
  return apiRequest<{ user: { id: string; role: string; status: string } }>(
    `/admin/users/${id}`,
    {
      method: 'PATCH',
      headers: {
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteUser(token?: string, id: string) {
  return apiRequest<void>(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function createUploadUrl(token?: string, filePath: string) {
  return apiRequest<{ uploadUrl: string; path: string }>(
    '/admin/videos/upload-url',
    {
      method: 'POST',
      headers: {
        ...authHeaders(token),
      },
      body: JSON.stringify({ filePath }),
    },
  )
}

export async function uploadVideo(formData: FormData) {
  const response = await fetch(`${API_BASE}/admin/videos/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const error: ApiError = new Error('Request failed')
    error.status = response.status
    try {
      const data = await response.json()
      if (data?.message) {
        error.message = data.message
      }
    } catch {
      // ignore parse errors
    }
    throw error
  }

  const text = await response.text()
  if (!text) {
    return {} as { video: { id: string } }
  }

  return JSON.parse(text) as { video: { id: string } }
}

export async function createVideo(token?: string, payload: { title: string; description?: string; storagePath: string; requiredRole: string; isPublished?: boolean; durationSeconds?: number }) {
  return apiRequest<{ video: { id: string } }>(
    '/admin/videos',
    {
      method: 'POST',
      headers: {
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function fetchAdminVideos(token?: string) {
  return apiRequest<{ videos: Array<{ id: string; title: string; description?: string; requiredRole: string; isPublished: boolean; storagePath: string; createdAt: string }> }>(
    '/admin/videos',
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function deleteVideo(token?: string, id: string) {
  return apiRequest<void>(`/admin/videos/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function updateVideo(
  token?: string,
  id: string,
  payload: { title?: string; description?: string; requiredRole?: string; isPublished?: boolean },
) {
  return apiRequest<{ video: { id: string } }>(`/admin/videos/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export async function fetchVideo(token?: string, id: string) {
  return apiRequest<{ video: { id: string; title: string; signedUrl?: string; requiredRole: string; durationSeconds?: number; completed?: boolean } }>(
    `/videos/${id}`,
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function fetchVideos(token?: string) {
  return apiRequest<{ videos: Array<{ id: string; title: string; description?: string; requiredRole: string; isPublished: boolean; durationSeconds?: number; completed?: boolean }> }>(
    '/videos',
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function updateVideoProgress(token?: string, id: string, completed: boolean) {
  return apiRequest<{ progress: { videoId: string; completed: boolean } }>(`/videos/${id}/progress`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify({ completed }),
  })
}

export async function fetchPosts(category?: 'NOTICE' | 'ACTIVITY') {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return apiRequest<{ posts: Array<{ id: string; title: string; content?: string; category: 'NOTICE' | 'ACTIVITY'; publishedAt: string; isPinned?: boolean; views?: number }> }>(
    `/posts${query}`,
  )
}

export async function fetchPost(id: string, increment = true) {
  const query = increment ? '' : '?increment=false'
  return apiRequest<{ post: { id: string; title: string; content?: string; category: 'NOTICE' | 'ACTIVITY'; publishedAt: string; isPinned?: boolean; views?: number } }>(
    `/posts/${id}${query}`,
  )
}

export async function fetchAdminPosts(token?: string) {
  return apiRequest<{ posts: Array<{ id: string; title: string; content?: string; category: 'NOTICE' | 'ACTIVITY'; isPublished: boolean; isPinned: boolean; views: number; publishedAt: string; createdAt: string }> }>(
    '/admin/posts',
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function createPost(token?: string, payload: { title: string; content?: string; category: 'NOTICE' | 'ACTIVITY'; isPinned?: boolean }) {
  return apiRequest<{ post: { id: string } }>(
    '/admin/posts',
    {
      method: 'POST',
      headers: {
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function updatePost(
  token?: string,
  id: string,
  payload: { title?: string; content?: string; category?: 'NOTICE' | 'ACTIVITY'; isPinned?: boolean },
) {
  return apiRequest<{ post: { id: string } }>(`/admin/posts/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export async function deletePost(token?: string, id: string) {
  return apiRequest<void>(`/admin/posts/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function createPostImageUploadUrl(token?: string, filePath: string) {
  return apiRequest<{ uploadUrl: string; publicUrl: string; path: string }>(
    '/admin/posts/upload-url',
    {
      method: 'POST',
      headers: {
        ...authHeaders(token),
      },
      body: JSON.stringify({ filePath }),
    },
  )
}
