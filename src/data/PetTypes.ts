import { IPetType } from "../../types/PetTypes";
import PngImage from "../assets/png";

export const petTypes: IPetType[] = [
    { id: 1, name: "강아지", image: PngImage.petType.dog },
    { id: 2, name: "고양이", image: PngImage.petType.cat },
];