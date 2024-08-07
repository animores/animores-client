export namespace AuthModel {
	export interface IEmailModel {
		state: 'none' | 'fail' | 'success';
	}
	export interface IVerificationModel {
		state: 'none' | 'dismatch' | 'timeout' | 'fail' | 'success';
	}
	export interface INicknameModel {
		state: 'none' | 'fail' | 'success';
	}
	export interface ILoginModel {
		email: string
		password: string
	}

	export interface ILoginResponseModel {
		data: {
			accessToken: string;
			refreshToken: string;
			userId: number;
			expirationHours: string;
			success: boolean;
		};
		status: number;
	}

	export interface IEmailVerificationCodeModel {
		email: string
	}

	export interface IJoinModel {
		email: string;
		password: string;
		nickname: string;
		isAdPermission: boolean;
	}

}