import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { logger } from '../../utils/logger';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { FormField } from '../../components/radix/FormField';
import { Input } from '../../components/radix/Input';
import { Button } from '../../components/radix/Button';
import './LoginPage.scss';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginPage() {
  const { t } = useTranslation('common');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const { lang } = useParams<{ lang: string }>(); // Removed unused variable
  const getLocalizedPath = useLocalizedLink();
  const { getFaceHomePath } = useFaceConfig();

  // Create validation schema with yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .required(t('pages.login.validation.emailRequired'))
      .email(t('pages.login.validation.emailInvalid')),
    password: yup
      .string()
      .required(t('pages.login.validation.passwordRequired'))
      .min(4, t('pages.login.validation.passwordMinLength')),
    rememberMe: yup.boolean().default(false),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: { rememberMe: false },
  });

  // Redirect if already authenticated
  const from = (location.state as { from?: string })?.from || getLocalizedPath(getFaceHomePath());

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, { rememberMe: data.rememberMe });
      logger.info('Login successful, redirecting', { email: data.email });
      toast.success(t('pages.login.success') || 'Login successful!');
      // Redirect to face home page after successful login
      const faceHomePath = getLocalizedPath(getFaceHomePath());
      navigate(faceHomePath, { replace: true });
    } catch (error) {
      logger.error('Login failed', error);
      // Extract error message from error
      let errorMessage = t('pages.login.error') || 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as { message?: string; error?: string; errorDescription?: string };
        errorMessage =
          errorObj.errorDescription || errorObj.error || errorObj.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-page-wrapper">
      <Container className="h-100">
        <Row className="h-100">
          <Col xs={12} className="d-flex align-items-center justify-content-center">
            <div className="login-card">
              <h2 className="login-title">{t('pages.login.title')}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <FormField
                  label={t('pages.login.email')}
                  htmlFor="email"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={isSubmitting}
                    error={!!errors.email}
                    placeholder={t('pages.login.email')}
                  />
                </FormField>

                <FormField
                  label={t('pages.login.password')}
                  htmlFor="password"
                  required
                  error={errors.password?.message}
                >
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    disabled={isSubmitting}
                    error={!!errors.password}
                    placeholder={t('pages.login.password')}
                  />
                </FormField>

                {/* Maps to OAuth2 rememberMe; API issues long-lived JWT only when checked (see Jwt:ExpiresInMinutesRememberMe). */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="form-check-input"
                      {...register('rememberMe')}
                      disabled={isSubmitting}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      {t('pages.login.rememberMe')}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="login-submit-button"
                >
                  {isSubmitting
                    ? t('pages.login.submitting') || 'Logging in...'
                    : t('pages.login.submit')}
                </Button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
