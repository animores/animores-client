import axios from "axios";
import { IAddTodo, IListToDoParam } from '../../types/AddToDo';
import { IToDoListResponse, IToDo } from '../../types/ToDo';
import { PeriodTodoListParams, TodoOverviewResponse } from './type/api/todo';
import AxiosContext from '../screens/context/AxiosContext';
import { normalizeToYmd } from '../js/util';
import { IApiResponse } from './type';
import { PeriodTodoListResponse } from '../types/api/todo';

export namespace ToDoService {
    export const todo = {
        /**
         * 투두 상세 조회 (상세 정보 전용)
         * - 요약 리스트(API)에서 받은 todoId를 이용해, 해당 투두의 모든 상세 필드를 조회합니다.
         * - 엔드포인트: GET /api/v1/todos/{id}
         * - 사용 예: period/list 등에서 축약 정보 수신 → 이 API로 상세 정보 보강
         */
        detail: async (id: number): Promise<IApiResponse<IToDo>> => {
            try {
                const response = await AxiosContext.get(`/api/v1/todos/${id}`);
                return response.data as IApiResponse<IToDo>;
            } catch (error) {
                console.error('ToDoService.todo.detail:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ToDoService.todo.detail:', error.response.data);
                    } else {
                        console.error('ToDoService.todo.detail:', error.message);
                    }
                }
                throw error;
            }
        },
        create: async (content: IAddTodo) => {
            try {
                const response = await AxiosContext.post(`/api/v1/todos`, content);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.create:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ToDoService.todo.create:', error.response.data);
                    } else {
                        console.error('ToDoService.todo.create:', error.message);
                    }
                }
                throw error;
            }
        },
        list: async (params: IListToDoParam): Promise<IToDoListResponse> => {
            try {
                var startEnd = ''
                var completed = ''
                var queryString = `/api/v1/todos/?${startEnd}${completed}page=${params.page}&size=${params.size}`;
                if(params.start != null) {
                    startEnd = `&start=${params.start}`;
                }
                if(params.end != null) {
                    startEnd = `&end=${params.end}`;
                }
                if(params.completed !=  null) {
                    completed = `&completed=${params.completed}`;
                }
                console.log(params.start, params.end);
                const response = await AxiosContext.get(queryString);
                return response.data;
            } catch (error) {
                console.error('ToDoService.todo.list:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ToDoService.todo.list:', error.response.data);
                    } else {
                        console.error('ToDoService.todo.list:', error.message);
                    }
                }
                throw error;
            }
        },
        /**
         * @desc 기간/완료 상태 필터 기반 목록 조회
         * @param {PeriodTodoListParams} params 기간별 조회 파라미터
         * @returns {Promise<TodoOverviewResponse>} 투두 개요 목록 응답
         */
        periodList: async (params: PeriodTodoListParams): Promise<PeriodTodoListResponse> => {
            try {
				// 기본값 설정
				const { start, end, completed, page = 0, size = 20 } = params;

				let queryString = `/api/v1/todos/?page=${page}&size=${size}`;
				const startNormalized = normalizeToYmd(start);
				const endNormalized = normalizeToYmd(end);
				if (startNormalized) {
					queryString += `&start=${encodeURIComponent(startNormalized)}`;
				}
				if (endNormalized) {
					queryString += `&end=${encodeURIComponent(endNormalized)}`;
				}
				if (typeof completed === 'boolean') {
					queryString += `&completed=${completed}`;
				}
				const response = await AxiosContext.get(queryString);
				return response.data as TodoOverviewResponse;
			} catch (error) {
				console.error('ToDoService.todo.periodList:', error);
				if (axios.isAxiosError(error)) {
					if (error.response) {
						console.error('ToDoService.todo.periodList:', error.response.data);
					} else {
						console.error('ToDoService.todo.periodList:', error.message);
					}
				}
				throw error;
			}
        },
        today: async (page: number, size: number) => {
            try {
                const response = await AxiosContext.get(`/api/v1/todos/today?page=${page}&size=${size}`);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.today:', error);
                return { data: null, status: error || 500 };
            }
        },
        check: async (id: number) => {
            try {
                const response = await AxiosContext.post(`/api/v1/todos/${id}/check`);
                console.log(response.data);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.check:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ToDoService.todo.check:', error.response.data);
                    }
                }
            }
        },
		update: async (id: number) => {
			try {
				const response = await AxiosContext.patch(`/api/v1/todos/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
				return { data: response.data, status: response.status };
			} catch (error) {
				console.error('ToDoService.todo.update:', error);
				return { data: null, status: error || error };
			}
		},
        delete: async (id: number) => {
            try {
                const response = await AxiosContext.delete(`/api/v1/todos/${id}`);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.delete:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ToDoService.todo.delete:', error.response.data);
                    }
                }
            }
        },
    };
}
