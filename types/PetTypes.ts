import { ImageProps } from "react-native";

export interface IPetType {
    id: number;
    name: string;
    image?: ImageProps;
}

export interface IBreedType {
    id : number;
    name : string;
}

export interface IPetRequest {
    breedId : number;
    imageId : number;
    name : string;
    gender : number;
    birthday : string;
    weight : number;
}