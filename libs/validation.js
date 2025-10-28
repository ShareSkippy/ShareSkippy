// API request validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{0,15}$/;
  return phoneRegex.test(phone.replace(/[()\s-]/g, ''));
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
  return true;
};

export const validateStringLength = (value, fieldName, minLength = 1, maxLength = 255) => {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  return true;
};

export const validateDate = (date, fieldName) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }
  return dateObj;
};

export const validateFutureDate = (date, fieldName) => {
  const dateObj = validateDate(date, fieldName);
  if (dateObj < new Date()) {
    throw new Error(`${fieldName} must be in the future`);
  }
  return dateObj;
};

export const validateUUID = (uuid, fieldName) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
  return true;
};

export const validateEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return true;
};

export const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  if (min !== null && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must be no more than ${max}`);
  }
  return num;
};

export const validateArray = (value, fieldName, minLength = 0, maxLength = null) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} must have at least ${minLength} items`);
  }
  if (maxLength !== null && value.length > maxLength) {
    throw new Error(`${fieldName} must have no more than ${maxLength} items`);
  }
  return true;
};

// Common validation schemas
export const meetingValidationSchema = {
  recipient_id: (value) => validateUUID(value, 'recipient_id'),
  title: (value) => {
    validateRequired(value, 'title');
    validateStringLength(value, 'title', 1, 255);
  },
  meeting_place: (value) => {
    validateRequired(value, 'meeting_place');
    validateStringLength(value, 'meeting_place', 1, 255);
  },
  start_datetime: (value) => validateFutureDate(value, 'start_datetime'),
  end_datetime: (value) => validateFutureDate(value, 'end_datetime'),
};

export const reviewValidationSchema = {
  meeting_id: (value) => validateUUID(value, 'meeting_id'),
  rating: (value) => validateNumber(value, 'rating', 1, 5),
  comment: (value) => validateStringLength(value, 'comment', 0, 1000),
};

export const profileValidationSchema = {
  first_name: (value) => {
    validateRequired(value, 'first_name');
    validateStringLength(value, 'first_name', 1, 50);
  },
  last_name: (value) => {
    validateRequired(value, 'last_name');
    validateStringLength(value, 'last_name', 1, 50);
  },
  phone_number: (value) => {
    if (value) validatePhoneNumber(value);
  },
  role: (value) => validateEnum(value, 'role', ['dog_owner', 'dog_sitter', 'both']),
};

// Validate request body against schema
export const validateRequestBody = (body, schema) => {
  const errors = [];

  for (const [field, validator] of Object.entries(schema)) {
    try {
      validator(body[field]);
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return true;
};
