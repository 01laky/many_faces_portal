import * as Label from '@radix-ui/react-label';
import './FormField.scss';
import type { FormFieldProps } from './types';

/**
 * Form field wrapper with label and error message
 */
export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
	return (
		<div className="form-field">
			<Label.Root htmlFor={htmlFor} className="form-label">
				{label}
				{required && <span className="form-required">*</span>}
			</Label.Root>
			{children}
			{error && <div className="form-error">{error}</div>}
		</div>
	);
}
