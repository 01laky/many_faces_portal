/**
 * Registration step 1 (portal): collect email + names, trigger `POST /api/oauth2/register/request`.
 * User must complete signup via the link in email (`RegisterCompletePage`).
 */
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { logger } from '../../utils/logger';
import { FormField } from '../../components/radix/FormField';
import { Input } from '../../components/radix/Input';
import { Button } from '../../components/radix/Button';
import { postRegisterRequest } from '../../api/registrationApi';
import { supportedLanguages } from '../../i18n/config';
import './RegisterPage.scss';
import type { RegisterRequestFormData } from './types';

export function RegisterPage() {
	const { t, i18n } = useTranslation('common');

	const validationSchema = yup.object({
		email: yup
			.string()
			.required(t('pages.register.validation.emailRequired'))
			.email(t('pages.register.validation.emailInvalid')),
		firstName: yup
			.string()
			.required(t('pages.register.validation.firstNameRequired'))
			.min(2, t('pages.register.validation.firstNameMinLength')),
		lastName: yup
			.string()
			.required(t('pages.register.validation.lastNameRequired'))
			.min(2, t('pages.register.validation.lastNameMinLength')),
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterRequestFormData>({
		resolver: yupResolver(validationSchema),
		mode: 'onBlur',
	});

	const onSubmit = async (data: RegisterRequestFormData) => {
		try {
			logger.info('Register request submitted', { email: data.email });
			const locale = supportedLanguages.includes(
				i18n.language as (typeof supportedLanguages)[number]
			)
				? i18n.language
				: 'en';
			await postRegisterRequest({
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				locale,
			});
			toast.success(t('pages.register.requestSuccess'));
		} catch (error: unknown) {
			logger.error('Registration request failed', error);
			toast.error(t('pages.register.error'));
		}
	};

	return (
		<div className="register-page-wrapper">
			<Container className="h-100">
				<Row className="h-100">
					<Col xs={12} className="d-flex align-items-center justify-content-center">
						<div className="register-card">
							<h2 className="register-title">{t('pages.register.title')}</h2>
							<p className="register-hint">{t('pages.register.requestHint')}</p>
							<form onSubmit={handleSubmit(onSubmit)} className="register-form">
								<FormField
									label={t('pages.register.email')}
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
										placeholder={t('pages.register.email')}
									/>
								</FormField>
								<FormField
									label={t('pages.register.firstName')}
									htmlFor="firstName"
									required
									error={errors.firstName?.message}
								>
									<Input
										id="firstName"
										type="text"
										{...register('firstName')}
										disabled={isSubmitting}
										error={!!errors.firstName}
										placeholder={t('pages.register.firstName')}
									/>
								</FormField>
								<FormField
									label={t('pages.register.lastName')}
									htmlFor="lastName"
									required
									error={errors.lastName?.message}
								>
									<Input
										id="lastName"
										type="text"
										{...register('lastName')}
										disabled={isSubmitting}
										error={!!errors.lastName}
										placeholder={t('pages.register.lastName')}
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
										: t('pages.register.requestSubmit')}
								</Button>
							</form>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
