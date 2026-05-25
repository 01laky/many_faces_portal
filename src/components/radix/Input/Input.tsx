import { forwardRef } from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

/**
 * Input component styled for forms
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ error, className, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={`radix-input ${error ? 'radix-input-error' : ''} ${className || ''}`}
				{...props}
			/>
		);
	}
);

Input.displayName = 'Input';
