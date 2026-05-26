export interface PasswordGrantTokenRequestParams {
	username: string;
	password: string;
	rememberMe?: boolean;
	clientId: string;
	clientSecret: string;
}
