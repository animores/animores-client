import cat from './cat.png';
import bird from './chick.png';
import dog from './dog.png';
import fish from './fish.png';
import rabbit from './rabbit.png';
import todoBottomTab from './tab1.png';
import calendarBottomTab from './tab2.png';
import homeBottomTab from './tab3.png';
import diaryBottomTab from './tab4.png';
import mypageBottomTab from './tab5.png';
import todoBottomTabActive from './tabActive1.png';
import calendarBottomTabActive from './tabActive2.png';
import homeBottomTabActive from './tabActive3.png';
import diaryBottomTabActive from './tabActive4.png';
import mypageBottomTabActive from './tabActive5.png';
import {ImageProps} from "react-native";

interface ImageObject {
	[key: string] : ImageProps;
}

const PngImage = {
	BottomTab: {
		todoBottomTab,
		calendarBottomTab,
		homeBottomTab,
		diaryBottomTab,
		mypageBottomTab,
		todoBottomTabActive,
		calendarBottomTabActive,
		homeBottomTabActive,
		diaryBottomTabActive,
		mypageBottomTabActive,
	},
	petType: {
		dog,
		bird,
		cat,
		fish,
		rabbit,
		//homeTheme1,
	} as ImageObject,
	petAdd: require('./petAdd.png'),
	profile: require('./profile.png'),
	getPetType: (name : string) => {
		switch (name) {
			case "강아지" : {
				return "dog";
			}
			case "고양이" : {
				return "cat";
			}
			default : {
				return "dog";
			}
		}
	}
}

export default PngImage;