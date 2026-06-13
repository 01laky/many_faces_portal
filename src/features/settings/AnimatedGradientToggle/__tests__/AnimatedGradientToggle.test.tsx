// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedGradientToggle } from '../AnimatedGradientToggle';

/**
 * Edge-case coverage for the settings switch (gradient prompt Phase C): checked state mirrors the raw
 * "want" flag, the switch is disabled under reduced motion or while saving, the hint text swaps for
 * reduced motion, and toggling calls through to setAnimationEnabled.
 */

const mockSetAnimationEnabled = vi.fn();
let mockPref: {
	userWantsAnimation: boolean;
	prefersReducedMotion: boolean;
	isUpdating: boolean;
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string, fb?: string) => fb ?? key }),
}));
vi.mock('../../../../contexts/GradientAnimationPreferenceContext', () => ({
	useGradientAnimationPreference: () => ({
		...mockPref,
		setAnimationEnabled: mockSetAnimationEnabled,
	}),
}));

function getSwitch() {
	return screen.getByRole('switch') as HTMLInputElement;
}

beforeEach(() => {
	mockSetAnimationEnabled.mockReset();
	mockPref = { userWantsAnimation: false, prefersReducedMotion: false, isUpdating: false };
});

describe('AnimatedGradientToggle', () => {
	it('renders the switch checked when the user wants animation', () => {
		mockPref.userWantsAnimation = true;
		render(<AnimatedGradientToggle />);
		expect(getSwitch().checked).toBe(true);
	});

	it('renders unchecked when the user does not want animation', () => {
		render(<AnimatedGradientToggle />);
		expect(getSwitch().checked).toBe(false);
	});

	it('calls setAnimationEnabled with the new value on toggle', () => {
		render(<AnimatedGradientToggle />);
		fireEvent.click(getSwitch());
		expect(mockSetAnimationEnabled).toHaveBeenCalledWith(true);
	});

	it('disables the switch and shows the reduced-motion hint under prefers-reduced-motion', () => {
		mockPref.prefersReducedMotion = true;
		render(<AnimatedGradientToggle />);
		expect(getSwitch().disabled).toBe(true);
		expect(screen.getByText('settingsPanel.animatedGradientReducedMotion')).toBeTruthy();
	});

	it('disables the switch while a save is in flight', () => {
		mockPref.isUpdating = true;
		render(<AnimatedGradientToggle />);
		expect(getSwitch().disabled).toBe(true);
	});

	it('shows the normal hint when motion is allowed', () => {
		render(<AnimatedGradientToggle />);
		expect(screen.getByText('settingsPanel.animatedGradientHint')).toBeTruthy();
	});
});
