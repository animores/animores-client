import * as ImagePicker from "expo-image-picker";
import {useState} from "react";


export const useImagePicker = () => {
    const [pickImage, setPickImage] = useState<string>("");

    //앨범 선택
    const handleOpenImagePicker = async () => {
        //접근 권한 요청
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("이미지를 등록하시려면 사진첩 권한이 필요합니다.");
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        result?.assets && setPickImage(result.assets[0].uri);
    };

    const handleOpenCamera = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            alert("카메라를 사용하려면 카메라 권한이 필요합니다.");
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        result?.assets && setPickImage(result.assets[0].uri);
    };

    return {handleOpenCamera, handleOpenImagePicker, pickImage, setPickImage}
}