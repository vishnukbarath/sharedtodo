import { z } from 'zod';
import { insertUserSchema, insertTodoSchema, insertCommentSchema, users, todos, comments, activityLogs, couples } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect & { coupleId?: number | null }>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  couple: {
    create: {
      method: 'POST' as const,
      path: '/api/couples' as const,
      responses: {
        201: z.custom<typeof couples.$inferSelect>(),
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/couples/join' as const,
      input: z.object({ inviteCode: z.string() }),
      responses: {
        200: z.custom<typeof couples.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/couple' as const,
      responses: {
        200: z.custom<typeof couples.$inferSelect & { members: typeof users.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  todos: {
    list: {
      method: 'GET' as const,
      path: '/api/todos' as const,
      responses: {
        200: z.array(z.custom<typeof todos.$inferSelect & { comments: typeof comments.$inferSelect[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/todos' as const,
      input: insertTodoSchema.omit({ coupleId: true, createdBy: true }),
      responses: {
        201: z.custom<typeof todos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/todos/:id' as const,
      input: insertTodoSchema.partial(),
      responses: {
        200: z.custom<typeof todos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/todos/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    create: {
      method: 'POST' as const,
      path: '/api/todos/:id/comments' as const,
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
      },
    },
  },
  activity: {
    list: {
      method: 'GET' as const,
      path: '/api/activity' as const,
      responses: {
        200: z.array(z.custom<typeof activityLogs.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
