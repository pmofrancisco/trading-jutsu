/**
 * Shared contract between `useActionState` forms and the Server Actions that
 * back them. `TField` names the form's fields.
 */
export interface FormState<TField extends string = never> {
  /** Validation errors, keyed by form field. */
  errors: Partial<Record<TField, string[]>>;
  /** An error that applies to the submission as a whole, not to one field. */
  formError?: string;
}

/**
 * Turns an unexpected failure into form state. The underlying error is logged
 * on the server rather than returned, so database and driver internals never
 * reach the client.
 */
export function toUnexpectedFormError<TField extends string>(
  err: unknown,
): FormState<TField> {
  console.error(err);

  return { errors: {}, formError: 'Something went wrong. Please try again.' };
}
