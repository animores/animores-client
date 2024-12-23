import AxiosContext from "../screens/context/AxiosContext";

export namespace ProfileService {
	export const profile = {
		//회원 정보 조회
		myProfile: async () => {
			try {
				const response = await AxiosContext.get(`/api/v1/account`);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('ProfileService.Profile.myProfile:', error);
				return { data: null, status: error };
			}
		},
		//프로필 목록 조회
		list: async () => {
			try {
				const response = await AxiosContext.get(`/api/v1/profiles`);
				return { data: response.data };
			} catch (error) {
				console.error('ProfileService.Profile.list:', error);
				return { data: null, status: error };
			}
		},
		//프로필 생성
		create: async (formData: FormData) => {
			try {
				const response = await AxiosContext.post(`/api/v1/profiles`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('ProfileService.Profile.create:', error);
				return { data: null, status: error || error };
			}
		},
		//프로필 수정
		edit: async (formData: FormData) => {
			try {
				const response = await AxiosContext.put(`/api/v1/profiles`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					},
				});
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('ProfileService.Profile.edit:', error);
				return { data: null, status: error || error };
			}
		},
		//프로필 삭제
		delete: async (profileId: string) => {
			console.log('profileId', profileId);
			try {
				const response = await AxiosContext.delete(`/api/v1/profiles/${profileId}`);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('ProfileService.Profile.edit:', error);
				return { data: null, status: error || error };
			}
		},
	}
}