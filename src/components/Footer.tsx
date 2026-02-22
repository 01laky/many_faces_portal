import { useTranslation } from 'react-i18next';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import './Footer.scss';

export function Footer() {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  return (
    <footer className="app-footer" style={gradientVars}>
      <div className="footer-border-top" />
      <div className="footer-main">
        <span className="footer-text">
          © {new Date().getFullYear()} {selectedFace?.title || 'Be Demo'}. {t('footer.rights')}
        </span>
      </div>
      <div className="footer-border-bottom" />
    </footer>
  );
}
