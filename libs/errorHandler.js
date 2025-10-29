// Centralized error handling for API routes

export class APIError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const handleAPIError = (error, request) => {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // Handle known error types
  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  // Handle Supabase errors
  if (error.code && error.message) {
    return {
      error: error.message,
      code: error.code,
      status: 400,
    };
  }

  // Handle validation errors
  if (error.message && error.message.includes('Validation failed')) {
    return {
      error: error.message,
      status: 400,
    };
  }

  // Handle authentication errors
  if (error.message && error.message.includes('Unauthorized')) {
    return {
      error: 'Authentication required',
      status: 401,
    };
  }

  // Handle rate limiting errors
  if (error.message && error.message.includes('Too many requests')) {
    return {
      error: error.message,
      status: 429,
    };
  }

  // Default error
  return {
    error: 'Internal server error',
    status: 500,
  };
};

export const withErrorHandling = (handler) => {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const errorResponse = handleAPIError(error, request);

      return new Response(
        JSON.stringify({
          error: errorResponse.error,
          code: errorResponse.code,
          timestamp: new Date().toISOString(),
        }),
        {
          status: errorResponse.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
};

// Common error responses
export const createErrorResponse = (message, status = 500, code = null) => {
  return new Response(
    JSON.stringify({
      error: message,
      code,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

export const createSuccessResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
