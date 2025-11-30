import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { ImagePickerIcon } from '../../assets/svg';
import { Colors } from '../../styles/Colors';
import Title from '../text/Title';

interface DiaryImageProps {
    /** 이미지 URL */
    uri: string;
    /** 이미지 스타일 */
    style?: StyleProp<ImageStyle>;
}

// 임시방편: S3 확장자 자동 재시도 (백엔드 수정 시 제거 필요) (현재 백엔드에서는 아래 3 확장자만 지원함)
const IMAGE_EXTENSIONS = ['jpg', 'png', 'mp4'];

/**
 * 일지 이미지 컴포넌트
 * 이미지 로딩 실패 시 다른 확장자로 재시도
 *
 * @임시방편 백엔드가 media.url에 확장자를 포함하지 않아 프론트에서 추론
 * TODO: 백엔드 API 수정 후 Fallback 로직 제거
 */
const DiaryImage: React.FC<DiaryImageProps> = ({ uri, style }) => {
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
    const [currentUri, setCurrentUri] = useState('');
    const [hasError, setHasError] = useState(false);

    // URI 변경 시 첫 번째 확장자로 초기화
    useEffect(() => {
        setCurrentExtensionIndex(0);
        setHasError(false);

        // 첫 번째 확장자로 URI 생성
        const uriWithExtension = `${uri}.${IMAGE_EXTENSIONS[0]}`;
        setCurrentUri(uriWithExtension);
    }, [uri]);

    // 이미지 로드 실패 시 다음 확장자로 재시도
    const handleError = () => {
        const nextIndex = currentExtensionIndex + 1;

        // 모든 확장자를 시도한 경우 플레이스홀더 표시
        if (nextIndex >= IMAGE_EXTENSIONS.length) {
            setHasError(true);
            return;
        }

        // 다음 확장자로 재시도
        const nextExtension = IMAGE_EXTENSIONS[nextIndex];
        const uriWithExtension = `${uri}.${nextExtension}`;

        setCurrentExtensionIndex(nextIndex);
        setCurrentUri(uriWithExtension);
    };

    if (hasError) {
        return (
            <View style={[styles.errorContainer, style]}>
                <ImagePickerIcon width={30} height={30} />
                <Title
                    text="이미지 로드 실패"
                    fontSize={10}
                    color={Colors.AEAEAE}
                    style={styles.errorText}
                />
            </View>
        );
    }

    return (
        <Image
            source={{ uri: currentUri }}
            style={style}
            onError={handleError}
        />
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: Colors.F4F4F4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 4,
    },
});

export default DiaryImage;
