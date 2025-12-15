import { IProfile } from "./Profile";
import { DiaryModel } from "../src/model/DiaryModel";

export type RootStackParams = {
	BottomTab: undefined;
	Login: undefined;
	Join: undefined;
	CreateDiary: undefined;
	UpdateDiary: DiaryModel.IDiaryModel;
	AddTodo: undefined;
	AlertSetting: undefined;
	CustomerService: undefined;
	Information: undefined;
	Notice: undefined;
	PetManagement: undefined;
	Profile: undefined;
	Profiles: undefined;
	PetType: undefined;
	BreedType: undefined;
	AddPet: undefined;
	CreateProfile: undefined;
	JoinCompleted: undefined;
	Home: undefined;
	EditProfile: { item: IProfile };
	ProfileManagement: undefined;
	UserVerification: undefined;
	ResetPassword: undefined;
	NewPassword: undefined;
};