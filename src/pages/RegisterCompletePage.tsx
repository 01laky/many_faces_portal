/**
 * Registration step 2 (portal): opened from email link `…/register/complete?hash=…`.
 * Submits verification code + password; on success stores OAuth tokens and navigates home (auto-login).
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormField } from '../components/radix/FormField';
import { Input } from '../components/radix/Input';
import { Button } from '../components/radix/Button';
import {
  getRegisterPrefill,
  persistTokensFromRegistration,
  postRegisterComplete,
} from '../api/registrationApi';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './RegisterPage.scss';

interface CompleteFormData {
  code: string;
  password: string;
  confirmPassword: string;
}

export function RegisterCompletePage() {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  /** Opaque invite id from mail link; must be paired with typed verification code on submit. */
  const hash = searchParams.get('hash') ?? '';
  const [email, setEmail] = useState('');
  type PrefillPhase = 'missing-hash' | 'loading' | 'ready';
  const [prefillPhase, setPrefillPhase] = useState<PrefillPhase>(() =>
    hash ? 'loading' : 'missing-hash'
  );

  const validationSchema = yup.object({
    code: yup.string().required(t('pages.register.validation.codeRequired')),
    password: yup
      .string()
      .required(t('pages.register.validation.passwordRequired'))
      .min(4, t('pages.register.validation.passwordMinLength'))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('pages.register.validation.passwordPattern')),
    confirmPassword: yup
      .string()
      .required(t('pages.register.validation.passwordRequired'))
      .oneOf([yup.ref('password')], t('pages.register.validation.passwordMismatch')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!hash) {
      return;
    }
    let cancelled = false;
    getRegisterPrefill(hash)
      .then((p) => {
        if (!cancelled && p.valid) {
          setEmail(p.email);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(t('pages.register.invalidLink'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPrefillPhase('ready');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hash, t]);

  const onSubmit = async (data: CompleteFormData) => {
    if (!hash) {
      toast.error(t('pages.register.missingHash'));
      return;
    }
    try {
      const tokens = await postRegisterComplete({
        hash,
        code: data.code.trim(),
        password: data.password,
      });
      persistTokensFromRegistration(tokens);
      toast.success(t('pages.register.completeSuccess'));
      navigate(getLocalizedPath('/'), { replace: true });
    } catch {
      toast.error(t('pages.register.completeError'));
    }
  };

  if (prefillPhase === 'missing-hash') {
    return (
      <div className="register-page-wrapper p-4 text-center">
        <p>{t('pages.register.missingHash')}</p>
        <Link to={getLocalizedPath('/register')}>{t('pages.register.title')}</Link>
      </div>
    );
  }

  if (prefillPhase === 'loading') {
    return null;
  }

  return (
    <div className="register-page-wrapper">
      <Container className="h-100">
        <Row className="h-100">
          <Col xs={12} className="d-flex align-items-center justify-content-center">
            <div className="register-card">
              <h2 className="register-title">{t('pages.register.completeTitle')}</h2>
              {email ? <p className="register-hint">{email}</p> : null}
              <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                <FormField
                  label={t('pages.register.codeLabel')}
                  htmlFor="code"
                  required
                  error={errors.code?.message}
                >
                  <Input
                    id="code"
                    type="text"
                    autoComplete="one-time-code"
                    {...register('code')}
                    disabled={isSubmitting}
                    error={!!errors.code}
                  />
                </FormField>
                <FormField
                  label={t('pages.register.password')}
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
                  />
                </FormField>
                <FormField
                  label={t('pages.register.confirmPassword')}
                  htmlFor="confirmPassword"
                  required
                  error={errors.confirmPassword?.message}
                >
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    disabled={isSubmitting}
                    error={!!errors.confirmPassword}
                  />
                </FormField>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="register-submit-button"
                >
                  {isSubmitting
                    ? t('pages.register.submitting')
                    : t('pages.register.completeSubmit')}
                </Button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
