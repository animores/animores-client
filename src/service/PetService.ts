import AxiosContext from "../screens/context/AxiosContext";

export namespace PetService {
    export const pet = {
        list: async () => {
            try {
                const response = await AxiosContext.get(`/api/v1/pets`);
                return { data: response.data, status: response.status };
            } catch (error) {
                console.error('PetService.pet.list:', error);
                return { data: null, status: error || 500 };
            }
        }
    }
}