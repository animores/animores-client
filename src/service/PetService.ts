import AxiosContext from "../screens/context/AxiosContext";
import {IPetType} from "../../types/PetTypes";

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
        },
        speciesList : async () : Promise<IPetType[]> => {
            try {
                const response = await AxiosContext.get(`/api/v1/pets/species`);
                return response.data?.data;
            }
            catch (error) {
                console.error('PetService.pet.speciesList:',error);
                return [];
            }
        },
        breedList : async (speciesId : number) => {
            try {
                const response = await AxiosContext.get(`/api/v1/pets/breeds?speciesId=${speciesId}`);
                return response.data?.data;
            }
            catch (error) {
                console.error(error);
                return [];
            }
        }
    }
}