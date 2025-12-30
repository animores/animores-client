import AxiosContext from "../screens/context/AxiosContext";
import axios from 'axios';
import { DiaryModel } from '../model/DiaryModel';
import { IApiResponse } from './type';
import { apiHandler } from './apiHandler';
import {readdirOrErrorSync} from "rimraf/dist/commonjs/readdir-or-error";

// 일지
export namespace DiaryService {
	export const diary = {
		list: async (profileId: number, page: number, size: number) => {
			try {
				const response = await AxiosContext.get(
					`/api/v1/diaries?profileId=${profileId}&page=${page}&size=${size}`
				);

                return { data: response.data, status: response.status };
            } catch (error) {
				console.error('DiaryService.diary.list:', error);
				return { data: null, status: error || 500 };
			}
		},
		create: async (formData: FormData) => {
			try {
				const response = await AxiosContext.post(`/api/v1/diaries`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				console.log('response', response);
				return { data: response.data, status: response.status };
			} catch (error: any) {
				console.error('DiaryService.diary.create:', error);
				return {
					data: null,
					status: error?.response?.status || 500,
					message: error?.message || 'Unknown error',
				};
			}
		},
		update: async (diaryId: number, payload: { profileId: number; content: string }) => {
			try {
				const response = await AxiosContext.patch(`/api/v1/diaries/${diaryId}`, JSON.stringify(payload), {
					headers: {
						'Content-Type': 'application/json',
					},
				});
				return { data: response.data, status: response.status };
			} catch (error: any) {
				console.error('DiaryService.diary.update:', error);
				return { data: null, status: error?.response?.status || 500 };
			}
		},
		delete: async (diaryId: number, profileId: number) => {
			try {
				const response = await AxiosContext.delete(`/api/v1/diaries/${diaryId}`, {
					data: {
						profileId,
					},
				});

				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.delete:', error);
				return { data: null, status: error || 500 };
			}
		},
		commentList: async (commentId: number, profileId: number, page: number, size: number) => {
			try {
				const response = await AxiosContext.get(
					`/api/v1/diaries/${commentId}/comments?profileId=${profileId}&page=${page}&size=${size}`
				);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.commentList:', error);
				return { data: null, status: error || 500 };
			}
		},
		addComment: async (profileId: number, diaryId: number, content: string) => {
			console.log('diaryId', diaryId, 'profileId', profileId);
			try {
				const response = await AxiosContext.post(`/api/v1/diary-comments`, {
					profileId,
					diaryId,
					content,
				});
				console.log('response', response);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.addComment:', error);
				return { data: null, status: error || 500 };
			}
		},
		commentDelete: async (commentId: number, profileId: number) => {
			console.log('commentId', commentId, 'profileId', profileId);
			try {
				const response = await AxiosContext.delete(`/api/v1/diary-comments/${commentId}`, {
					data: {
						profileId,
					},
				});
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.commentDelete:', error);
				return { data: null, status: error || 500 };
			}
		},
		addReply: async (profileId: number, diaryCommentId: number, content: string) => {
			console.log('들어옴11', profileId, diaryCommentId, content);

			try {
				const response = await AxiosContext.post(`/api/v1/diary-reply`, {
					profileId,
					diaryCommentId,
					content,
				});
				console.log('response', response);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.addReply:', error);
				return { data: null, status: error || 500 };
			}
		},
		replyDelete: async (replyId: number) => {
			console.log('replyId', replyId);
			try {
				const response = await AxiosContext.delete(`/api/v1/diary-reply/${replyId}`);
				console.log("replyDelete response:", response.data);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.replyDelete:', error);
				return { data: error?.response?.data ?? null, status: error?.response?.status ?? 500 };
			}
		},
		replyList: async (commentId: number, profileId: number, page: number, size: number) => {
			try {
				const response = await AxiosContext.get(
					`/api/v1/diary-comments/${commentId}/replies?profileId=${profileId}&page=${page}&size=${size}`
				);
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('DiaryService.diary.replyList:', error);
				return { data: null, status: error || 500 };
			}
		},
		calendar: async (profileId: number, date: string): Promise<DiaryModel.IDiaryCalendarData> => {
			return apiHandler<DiaryModel.IDiaryCalendarData>(
				() =>
					AxiosContext.get<IApiResponse<DiaryModel.IDiaryCalendarData>>(
						`/api/v1/diaries/calendar?profileId=${profileId}&date=${date}`
					),
				'DiaryService.diary.calendar'
			);
		},
	};
}