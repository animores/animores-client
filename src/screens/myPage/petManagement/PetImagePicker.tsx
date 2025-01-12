import {Image, Pressable, StyleSheet, View} from "react-native";
import {CameraIcon, ImagePickerIcon} from "../../../assets/svg";
import React, {useEffect, useState} from "react";
import {IconButton} from "../../../components/button/Button";
import {useImagePicker} from "../../../hooks/useImagePicker";
import asset from "../../../assets/png";
import BottomModal from "../../../components/modal/BottomModal";

export default function PetImagePicker() {
    const {handleOpenImagePicker, handleOpenCamera, pickImage} = useImagePicker();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const footer = () => {
        return <View style={[styles.buttonContainer, {paddingTop: 48}]}>
            <IconButton text={"사진 보관함"} onPress={handleOpenImagePicker}
                        icon={<ImagePickerIcon width={24} height={24}/>}/>
            <IconButton text={"사진 찍기"} onPress={handleOpenCamera} icon={<CameraIcon width={24} height={24}/>}/>
        </View>
    }

    useEffect(() => {
        setIsVisible(false);
    }, [pickImage]);

    return (
        <>
            <Pressable onPress={() => setIsVisible(true)}>
                <Image
                    source={pickImage !== "" ? {uri: pickImage} : asset.profile}
                    style={styles.image}
                />
            </Pressable>
            <BottomModal
                isVisible={isVisible}
                onClose={() => {
                    setIsVisible(false);
                }}
                BottomText={"기본 이미지로 할래요"} footer={footer}>
            </BottomModal>
        </>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 20
    },
    image : {
        marginTop: 50,
        marginBottom: 10,
        borderRadius : 50,
        borderWidth : 1,
        alignSelf: "center",
        width : 100,
        height: 100,
    }
})