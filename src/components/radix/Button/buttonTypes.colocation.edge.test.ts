import { describe, expect, it } from 'vitest';
import type { ButtonProps } from './types';

describe('Button colocated props type', () => {
	it('variant union covers portal button tones', () => {
		const variants: NonNullable<ButtonProps['variant']>[] = [
			'primary',
			'secondary',
			'danger',
			'outline',
		];
		expect(new Set(variants).size).toBe(4);
	});

	it('inherits native button attributes such as disabled and type', () => {
		const props: ButtonProps = {
			disabled: true,
			type: 'submit',
			'aria-label': 'Save',
		};
		expect(props.disabled).toBe(true);
		expect(props.type).toBe('submit');
		expect(props['aria-label']).toBe('Save');
	});

	it('allows omitting variant for default styling', () => {
		const props: ButtonProps = { children: 'Click' };
		expect(props.variant).toBeUndefined();
	});
});
