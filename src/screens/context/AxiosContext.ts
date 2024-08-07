import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthService } from '../../service/AuthService';

// Axios 인스턴스 생성
const instance = axios.create({
	timeout: 20000,
	withCredentials: false,
	responseType: 'json',
	headers: {
		'Content-Type': 'application/json',
	},
	baseURL: 'http://180.229.5.21:8080',
} as AxiosRequestConfig);

//요청 인터셉터
instance.interceptors.request.use(
	async (config) => {
		const accessToken = await AsyncStorage.getItem('accessToken');
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

//응답 인터셉터
instance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originRequest = error.config;

		if (error.response.status === 401 && !originRequest._retry) {
			originRequest._retry = true;

			const refreshToken = await AsyncStorage.getItem('refreshToken');
	
			if (refreshToken) {
				const response = await AuthService.Auth.refreshToken(refreshToken);
		
				if (response && response.data.success) {
					const { accessToken } = response.data;

					await AsyncStorage.setItem('accessToken', accessToken);
					originRequest.headers.Authorization = `Bearer ${accessToken}`;

					return instance(originRequest);
				}
			}
		}

		return Promise.reject(error);
	}
)

export default instance;