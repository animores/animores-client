import axios from "axios";
import {IAddTodo, IListToDoParam} from "../../types/AddToDo";
import AxiosContext from "../screens/context/AxiosContext";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export namespace ToDoService {
    export const todo = {
        create: async (content: IAddTodo) => {
            try {
                const response = await AxiosContext.post(`/api/v1/todos`, content);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.create:', error);
                if	(axios.isAxiosError(error)) {
					if (error.response) {
						console.error('ProfileService.Profile.create:', error.response.data);
					} else {
						console.error('ProfileService.Profile.create:', error.message);
					}
				}
                throw error;
            }
        },
        list: async (params: IListToDoParam) => { 
            try {
                var queryString = `/api/v1/todos?page=${params.page}&size=${params.size}`;
                if(params.done !==  null) {
                    queryString += `&done=${params.done}`;
                }
                if(params.pets !== null) {
                    for(const pet of params.pets) {
                        queryString += `&pets=${pet}`;
                    }
                }
                const response = await AxiosContext.get(queryString);
                return response.data;
            } catch (error) {
                console.error('ToDoService.todo.list:', error);
                if	(axios.isAxiosError(error)) {
					if (error.response) {
						console.error('ProfileService.Profile.list:', error.response.data);
					} else {
						console.error('ProfileService.Profile.list:', error.message);
					}
				}
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
                console.log(response);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.check:', error);
                if	(axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ProfileService.Profile.check:', error.response.data);
                    }
                }
            }
        },
        delete: async (id: number) => {
            try {
                const response = await AxiosContext.delete(`/api/v1/todos/${id}`);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.delete:', error);
                if	(axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ProfileService.Profile.delete:', error.response.data);
                    }
                }
            }
        },
        get: async (id: number) => {
            try {
                const response = await AxiosContext.get(`/api/v1/todos/${id}`);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.get:', error);
                if	(axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ProfileService.Profile.get:', error.response.data);
                    }
                }
            }
        },
        update: async (id: number, content: IAddTodo) => {
            try {
                const response = await AxiosContext.patch(`/api/v1/todos/${id}`, content);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('ToDoService.todo.update:', error);
                if	(axios.isAxiosError(error)) {
                    if (error.response) {
                        console.error('ProfileService.Profile.update:', error.response.data);
                    }
                }
            }
        }
    }
}