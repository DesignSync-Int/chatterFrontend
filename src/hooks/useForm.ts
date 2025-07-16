import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { z } from 'zod';
import { validateForm } from '../utils/validation';

interface UseFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: Record<string, any>;
  onSubmit: (data: T) => void | Promise<void>;
}

interface UseFormReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent) => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const { isValid, errors: validationErrors } = validateForm(schema, values);
    setErrors(validationErrors);
    return isValid;
  }, [schema, values]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = validateForm(schema, values);
      if (data) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, schema, values, onSubmit]);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const { isValid } = validateForm(schema, values);

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    validate,
  };
}
