import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGradientAnimationPreference } from '../../../contexts/GradientAnimationPreferenceContext';

export function AnimatedGradientToggle() {
  const { t } = useTranslation('common');
  const { userWantsAnimation, prefersReducedMotion, setAnimationEnabled, isUpdating } =
    useGradientAnimationPreference();

  return (
    <div className="settings-section settings-toggle-section">
      <div className="settings-label">
        <Sparkles size={18} />
        {t('settingsPanel.animatedGradient')}
      </div>
      <label className="settings-toggle-row">
        <input
          id="settings-animated-gradient"
          type="checkbox"
          role="switch"
          className="settings-toggle-input"
          checked={userWantsAnimation}
          disabled={prefersReducedMotion || isUpdating}
          aria-label={t('settingsPanel.animatedGradientAria')}
          onChange={(e) => void setAnimationEnabled(e.target.checked)}
        />
        <span className="settings-toggle-track" aria-hidden />
      </label>
      <p className="settings-toggle-hint">
        {prefersReducedMotion
          ? t('settingsPanel.animatedGradientReducedMotion')
          : t('settingsPanel.animatedGradientHint')}
      </p>
    </div>
  );
}
