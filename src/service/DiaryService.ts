import AxiosContext from "../screens/context/AxiosContext";

// 일지
export namespace DiaryService {
	export const diary = {
		list: async (profileId: number, page: number, size: number) => {
			try {
				const response = await AxiosContext.get
				(`/api/v1/diaries?profileId=${profileId}&page=${page}&size=${size}`);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.list:', error);
				return { data: null, status: error || 500 };
			}
		},
		create: async (profileId: number, content: string) => {
			const formData = new FormData();
			formData.append('profileId', profileId.toString());
			formData.append('content', content);

			try {
				const response = await AxiosContext.post(`/api/v1/diaries`, formData);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.create:', error);
				return { data: null, status: error || 500 };
			}
		},
		delete: async (diaryId: number) => {
			try {
				const response = await AxiosContext.delete(`/api/v1/diaries/${diaryId}`, {
					data: {
						profileId: 1
					}
				});

				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.delete:', error);
				return { data: null, status: error || 500 };
			}
		}
	}
}