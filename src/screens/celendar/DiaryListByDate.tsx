import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/type';
import { useDiaryListByDate } from '../../hooks/useDiaryList';
import DiaryList from '../../components/diary/DiaryList';
import BottomModal from '../../components/modal/BottomModal';
import Title from '../../components/text/Title';
import CommentList from '../diary/CommentList';
import { DiaryModel } from '../../model/DiaryModel';
import { DiaryService } from '../../service/DiaryService';
import { QueryKey } from '../../statics/constants/Querykey';
import { ScreenName } from '../../statics/constants/ScreenName';
import { Colors } from '../../styles/Colors';

interface DiaryListByDateProps {
    profileId: number;
    date: string; // YYYY-MM-DD
}

const DiaryListByDate: React.FC<DiaryListByDateProps> = ({ profileId, date }) => {
    const queryClient = useQueryClient();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [isFirstVisibleMore, setIsFirstVisibleMore] = useState<boolean>(false);
    const [isVisibleDelete, setIsVisibleDelete] = useState<boolean>(false);
    const [isVisibleComment, setIsVisibleComment] = useState<boolean>(false);
    const [isComment, setIsComment] = useState<boolean>(false);
    const [diaryId, setDiaryId] = useState<number | null>(null);
    const [commentProfileId, setCommentProfileId] = useState<number | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<DiaryModel.IDiaryModel | null>(null);

    const { diaries, isLoading } = useDiaryListByDate({
        profileId,
        date,
        enabled: Boolean(profileId && date),
        staleTimeMs: 60 * 1000,
    });

    // 일지 삭제
    const { mutate: deleteDiaryMutate } = useMutation(
        ({ diaryId, profileId }: { diaryId: number; profileId: number }) =>
            DiaryService.diary.delete(diaryId, profileId),
        {
            onSuccess: async (data) => {
                if (data && data.status === 200) {
                    Toast.show({
                        type: 'success',
                        text1: '삭제되었습니다.',
                    });

                    setIsFirstVisibleMore(false);
                    setIsVisibleDelete(false);
                    await queryClient.invalidateQueries([QueryKey.DIARY_LIST]);
                }
            },
            onError: (error) => {
                console.error('Delete error:', error);
            },
        }
    );

    // More 아이콘 클릭 핸들러
    const handlePressMore = (item: DiaryModel.IDiaryModel) => {
        setIsFirstVisibleMore(true);
        setSelectedProfileId(item.profileId);
        setSelectedItem(item);
    };

    // 댓글 아이콘 클릭 핸들러
    const handlePressComment = (item: DiaryModel.IDiaryModel) => {
        setIsComment(item.commentCount > 0);

        if (item.diaryId !== null && item.profileId !== null) {
            setDiaryId(item.diaryId);
            setCommentProfileId(item.profileId);
        }
        setIsVisibleComment(true);
    };

    // 수정 버튼 핸들러
    const handleEdit = () => {
        if (selectedItem) {
            navigation.navigate(ScreenName.UpdateDiary, { item: selectedItem });
            setIsFirstVisibleMore(false);
        }
    };

    // 삭제 버튼 핸들러
    const handleDelete = async () => {
        if (selectedItem && selectedProfileId !== null) {
            deleteDiaryMutate({ diaryId: selectedItem.diaryId, profileId: selectedProfileId });
        } else {
            console.log('diary delete error');
        }
    };

    // 더보기 모달 footer
    const FooterMore = () => {
        return (
            <View style={styles.bottomModalContainer}>
                <View style={styles.footerTopLine} />
                <View style={[styles.footer, { marginTop: 33 }]}>
                    <View style={[styles.buttonContainer, { marginRight: 10 }]}>
                        <Pressable onPress={handleEdit} style={styles.buttonContainer}>
                            <Title
                                text={'수정'}
                                fontSize={16}
                                color={Colors.White}
                                style={{ textAlign: 'center' }}
                            />
                        </Pressable>
                    </View>
                    <Pressable
                        onPress={() => {
                            setIsVisibleDelete(true);
                        }}
                        style={styles.buttonContainer}
                    >
                        <Title
                            text={'삭제'}
                            fontSize={16}
                            color={Colors.White}
                            style={{ textAlign: 'center' }}
                        />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <>
            <DiaryList
                diaries={diaries}
                onPressMore={handlePressMore}
                onPressComment={handlePressComment}
                enableActions={true}
                isLoading={isLoading}
            />

            {/* 수정/삭제 모달 */}
            <BottomModal
                isVisible={isFirstVisibleMore}
                onClose={() => {
                    setIsFirstVisibleMore(false);
                }}
                // 중첩 모달
                _isVisible={isVisibleDelete}
                _onClose={() => setIsVisibleDelete(false)}
                _title="게시물을 삭제하시겠어요?"
                _subTitle="삭제 이후에는 게시물이 영구적으로 삭제되며, 복원하실 수 없습니다."
                _onDelete={handleDelete}
            >
                <FooterMore />
            </BottomModal>

            {/* 댓글 모달 */}
            <CommentList
                visible={isVisibleComment}
                setIsVisibleComment={setIsVisibleComment}
                diaryId={diaryId ?? 0}
                isComment={isComment}
                profileId={commentProfileId ?? 0}
                setSelectedCommentId={() => {}}
            />
        </>
    );
};

export default DiaryListByDate;

const styles = StyleSheet.create({
    bottomModalContainer: {
        marginTop: 15,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    footerTopLine: {
        backgroundColor: Colors.Gray838383,
        height: 1.5,
        width: 50,
        alignSelf: 'center',
    },
    buttonContainer: {
        backgroundColor: Colors.FB3F7E,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        borderRadius: 10,
    },
});
