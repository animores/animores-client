import { atom } from "recoil";
import { IPetType } from "../../types/PetTypes";

export const PetListAtom = atom<IPetType[]>({
    key: 'PetListAtom',
    default: [],
});