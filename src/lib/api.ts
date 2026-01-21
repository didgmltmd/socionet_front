const API_BASE =
  import.meta.env.VITE_API_URL || 'https://socionetback-production.up.railway.app'

const authHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {}

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

export async function updateUser(id: string, payload: { status?: string; role?: string }, token?: string) {
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

export async function deleteUser(id: string, token?: string) {
  return apiRequest<void>(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function createUploadUrl(filePath: string, token?: string) {
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

export async function createVideo(payload: { title: string; description?: string; storagePath: string; requiredRole: string; isPublished?: boolean; durationSeconds?: number }, token?: string) {
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
  return apiRequest<{ videos: Array<{ id: string; title: string; description?: string; requiredRole: string; isPublished: boolean; storagePath: string; createdAt: string; durationSeconds?: number }> }>(
    '/admin/videos',
    {
      headers: {
        ...authHeaders(token),
      },
    },
  )
}

export async function deleteVideo(id: string, token?: string) {
  return apiRequest<void>(`/admin/videos/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function updateVideo(
  id: string,
  payload: { title?: string; description?: string; requiredRole?: string; isPublished?: boolean; durationSeconds?: number | null },
  token?: string,
) {
  return apiRequest<{ video: { id: string } }>(`/admin/videos/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export async function fetchVideo(id: string, token?: string) {
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

export async function updateVideoProgress(id: string, completed: boolean, token?: string) {
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

export async function createPost(payload: { title: string; content?: string; category: 'NOTICE' | 'ACTIVITY'; isPinned?: boolean }, token?: string) {
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
  id: string,
  payload: { title?: string; content?: string; category?: 'NOTICE' | 'ACTIVITY'; isPinned?: boolean },
  token?: string,
) {
  return apiRequest<{ post: { id: string } }>(`/admin/posts/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export async function deletePost(id: string, token?: string) {
  return apiRequest<void>(`/admin/posts/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(token),
    },
  })
}

export async function createPostImageUploadUrl(filePath: string, token?: string) {
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
