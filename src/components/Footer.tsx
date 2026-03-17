import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import './Footer.scss';

interface FooterProps {
  onMessagesClick?: () => void;
}

export function Footer({ onMessagesClick }: FooterProps) {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  return (
    <footer className="app-footer" style={gradientVars}>
      <div className="footer-border-top" />
      <div className="footer-main">
        <div className="footer-panel">
          {onMessagesClick && (
            <button
              type="button"
              className="footer-messages-btn"
              onClick={onMessagesClick}
              aria-label={t('messenger.title')}
            >
              <MessageCircle size={20} />
              <span className="footer-messages-label">{t('messenger.title')}</span>
            </button>
          )}
          <span className="footer-text">
            © {new Date().getFullYear()} {selectedFace?.title || 'Be Demo'}. {t('footer.rights')}
          </span>
        </div>
      </div>
      <div className="footer-border-bottom" />
    </footer>
  );
}
