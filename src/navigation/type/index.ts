import { IProfile } from "../../../types/Profile";
import { IToDo } from "../../../types/ToDo";
import { ScreenName } from "../../statics/constants/ScreenName"

export type RootStackParamList = {
    [ScreenName.Login]: undefined;
    [ScreenName.Join]: undefined;
    [ScreenName.JoinCompleted]: undefined;
    [ScreenName.CreateDiary]: undefined;
    [ScreenName.AddTodo]: { todo?: number };
	[ScreenName.PatManagement]: undefined;
	[ScreenName.PetType]: undefined;
	[ScreenName.BreedType]: undefined;
	[ScreenName.AddPet]: undefined;
	[ScreenName.Mypage]: undefined;
	[ScreenName.Home]: undefined;
	[ScreenName.Profiles]: undefined;
	[ScreenName.CreateProfile]: undefined;
	[ScreenName.UserVerification]: undefined;
	[ScreenName.ResetPassword]: undefined;
	[ScreenName.NewPassword]: undefined;
	[ScreenName.BottomTab]: undefined;
	[ScreenName.EditProfile]: { item: IProfile };
	[ScreenName.ProfileManagement]: undefined;
	[ScreenName.ToDoList]: undefined;
}