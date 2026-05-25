import { forwardRef } from 'react';
import './Button.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

/**
 * Button component with variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'primary', className, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={`radix-button radix-button-${variant} ${className || ''}`}
				{...props}
			>
				{children}
			</button>
		);
	}
);

Button.displayName = 'Button';
