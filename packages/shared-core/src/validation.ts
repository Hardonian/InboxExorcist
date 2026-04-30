export type ValidationRule = {
  field: string;
  test: (value: unknown) => boolean;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validate(rules: ValidationRule[], data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  for (const rule of rules) {
    const value = data[rule.field];
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function required(field: string): ValidationRule {
  return {
    field,
    test: (v) => v !== undefined && v !== null && v !== "",
    message: `${field} is required`,
  };
}

export function isString(field: string): ValidationRule {
  return {
    field,
    test: (v) => typeof v === "string",
    message: `${field} must be a string`,
  };
}

export function isNumber(field: string): ValidationRule {
  return {
    field,
    test: (v) => typeof v === "number" && !Number.isNaN(v),
    message: `${field} must be a number`,
  };
}

export function isArray(field: string): ValidationRule {
  return {
    field,
    test: (v) => Array.isArray(v),
    message: `${field} must be an array`,
  };
}

export function minLength(field: string, min: number): ValidationRule {
  return {
    field,
    test: (v) => typeof v === "string" && v.length >= min,
    message: `${field} must be at least ${min} characters`,
  };
}

export function maxNumber(field: string, max: number): ValidationRule {
  return {
    field,
    test: (v) => typeof v === "number" && v <= max,
    message: `${field} must not exceed ${max}`,
  };
}
