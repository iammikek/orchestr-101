class Validator {
  static firstError(data, rules) {
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field] ?? null;
      let skipField = false;

      for (const rule of fieldRules) {
        if (rule === 'nullable' && (value === null || value === '')) {
          skipField = true;
          break;
        }
        if (skipField) break;

        const error = this.checkRule(field, value, rule, data);
        if (error != null) return error;
      }
    }
    return null;
  }

  static checkRule(field, value, rule, data) {
    const label = field.replace(/_/g, ' ');

    if (rule === 'required') {
      if (value === null || value === '') {
        return `The ${label} field is required.`;
      }
      return null;
    }

    if (rule.startsWith('min:')) {
      const min = Number(rule.slice(4));
      if (typeof value === 'string' && value.length < min) {
        return `The ${label} field must be at least ${min} characters.`;
      }
      if (typeof value === 'number' && value < min) {
        return `The ${label} field must be at least ${min}.`;
      }
      return null;
    }

    if (rule.startsWith('max:')) {
      const max = Number(rule.slice(4));
      if (typeof value === 'string' && value.length > max) {
        return `The ${label} field must not be greater than ${max} characters.`;
      }
      if (typeof value === 'number' && value > max) {
        return `The ${label} field must not be greater than ${max}.`;
      }
      return null;
    }

    if (rule === 'email') {
      if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `The ${label} field must be a valid email address.`;
      }
      return null;
    }

    if (rule === 'string') {
      if (value !== null && typeof value !== 'string') {
        return `The ${label} field must be a string.`;
      }
      return null;
    }

    if (rule === 'integer') {
      if (value !== null && value !== '' && !Number.isInteger(Number(value))) {
        return `The ${label} field must be an integer.`;
      }
      return null;
    }

    if (rule === 'numeric') {
      if (value !== null && value !== '' && Number.isNaN(Number(value))) {
        return `The ${label} field must be a number.`;
      }
      return null;
    }

    if (rule === 'gt:0') {
      if (value !== null && value !== '' && Number(value) <= 0) {
        return `The ${label} field must be greater than 0.`;
      }
      return null;
    }

    if (rule === 'confirmed') {
      const confirmation = data[`${field}_confirmation`];
      if (value !== confirmation) {
        return `The ${label} confirmation does not match.`;
      }
      return null;
    }

    return null;
  }
}

module.exports = { Validator };
