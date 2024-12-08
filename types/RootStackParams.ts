import { IProfile } from "./Profile";
import { IToDo } from "./ToDo";

export type RootStackParams = {
	BottomTab: undefined;
	Login: undefined;
	Join: undefined;
	CreateDiary: undefined;
	AddTodo: undefined | {todo : IToDo};
	AlertSetting: undefined;
	CustomerService: undefined;
	Information: undefined;
	Notice: undefined;
	PatManagement: undefined;
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