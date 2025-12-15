import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider, useController, useForm } from 'react-hook-form';
import { AddImage } from '../../assets/svg';
import Title from '../text/Title';
import HeaderNavigation from '../../navigation/HeaderNavigation';
import { DiaryFormEditorProps } from './types';
import { diaryStyles } from './styles';
import { IMAGE_BASE_URL } from '@env';
import DiaryImage from './DiaryImage';

/**
 * 일지 작성/수정 공통 폼 컴포넌트
 */
const DiaryFormEditor: React.FC<DiaryFormEditorProps> = ({
    initialContent = '',
    initialImageUrls = [],
    onSubmit,
    submitButtonText,
    headerTitle,
    onBack,
}) => {
    const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
    const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

    // media 배열에서 이미지만 필터링 및 URL 변환
    const imagesToDisplay = React.useMemo(() => {
        if (initialImageUrls && initialImageUrls.length > 0) {
          return initialImageUrls
            .filter((mediaItem) => mediaItem.type === 'I')
            .sort((a, b) => a.order - b.order)
            .map((mediaItem) => `${IMAGE_BASE_URL}/${mediaItem.url}`);
        }
        return [];
    }, [initialImageUrls]);

    const methods = useForm({
        defaultValues: {
            diary: initialContent,
        },
    });

    const { control } = methods;
    const { field } = useController({
        control,
        name: 'diary',
        rules: { required: true },
    });

    const uploadImage = async () => {
        if (!status?.granted) {
            const permission = await requestPermission();
            if (!permission.granted) {
                return null;
            }
        }

        const cameraImage = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
            aspect: [1, 1],
        });

        if (cameraImage.canceled) {
            return null;
        }

        if (imageUrls.includes(cameraImage.assets[0].uri)) {
            return null;
        }

        setImageUrls([...imageUrls, cameraImage.assets[0].uri]);
    };

    const handleSubmit = async () => {
      console.log(imageUrls);
      const content = methods.getValues('diary');
      await onSubmit(content, imageUrls);
    };

    return (
        <FormProvider {...methods}>
            <SafeAreaView style={diaryStyles.formContainer}>
                <HeaderNavigation
                    middletitle={headerTitle}
                    rightTitle={submitButtonText}
                    hasBackButton={true}
                    onPressBackButton={onBack}
                    onPressRightButton={handleSubmit}
                    content={methods.getValues('diary')}
                />
                <ScrollView>
                    <TextInput
                        multiline
                        numberOfLines={20}
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="내용을 작성해주세요"
                        style={diaryStyles.textInput}
                    />
                    <View style={diaryStyles.formBottomLine} />
                    <Pressable onPress={uploadImage} style={diaryStyles.imageContainer}>
                        <Title text={'사진 등록'} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {imagesToDisplay.length > 0 ? (
                            imagesToDisplay.map((url, index) => (
                              <View key={index} style={diaryStyles.selectedImageContainer}>
                                <Image
                                  source={{ uri: url }}
                                  style={diaryStyles.selectedImage}
                                />
                                {index === imagesToDisplay.length - 1 && (
                                  <AddImage style={{ marginLeft: 11 }} />
                                )}
                              </View>
                            ))
                          ) : (
                            <AddImage style={{ marginTop: 11 }} />
                          )}

                          {/* {imageUrls.length > 0 ? (
                            imageUrls.map((url, index) => (
                              <View key={index} style={diaryStyles.selectedImageContainer}>
                                <DiaryImage
                                    uri={url}
                                    style={diaryStyles.selectedImage}
                                />
                                {index === imageUrls.length - 1 && (
                                  <AddImage style={{ marginLeft: 11 }} />
                                )}
                              </View>
                            ))
                          ) : (
                            <AddImage style={{ marginTop: 11 }} />
                          )} */}
                        </ScrollView>
                    </Pressable>
                    <View style={diaryStyles.videoContainer}>
                        <Title text={'동영상 등록 (최대 60초)'} />
                        <AddImage style={{ marginTop: 11 }} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </FormProvider>
    );
};

export default DiaryFormEditor;
