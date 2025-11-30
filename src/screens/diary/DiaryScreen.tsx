import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import FloatingButton from "../../components/button/FloatingButton";
import BottomModal from "../../components/modal/BottomModal";
import Title from "../../components/text/Title";
import { DiaryModel } from "../../model/DiaryModel";
import HeaderNavigation from "../../navigation/HeaderNavigation";
import { DiaryService } from "../../service/DiaryService";
import { QueryKey } from "../../statics/constants/Querykey";
import { Colors } from "../../styles/Colors";
import CommentList from "./CommentList";
import { ScreenName } from "../../statics/constants/ScreenName";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/type";
import DiaryList from "../../components/diary/DiaryList";

const DiaryScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [isFirstVisibleMore, setIsFirstVisibleMore] = useState<boolean>(false); //더보기(수정/삭제) 모달
  const [isVisibleDelete, setIsVisibleDelete] = useState<boolean>(false); // 일지삭제 확인 모달 보이기
  const [isVisibleMenu, setIsVisibleMenu] = useState<boolean>(false); //플로팅버튼
  const [isVisibleComment, setIsVisibleComment] = useState<boolean>(false); //댓글 모달
  const [isComment, setIsComment] = useState<boolean>(false); //댓글 유무
  const [diaryId, setDiaryId] = useState<number | null>(null);  //댓글 diary Id
  const [profileId, setProfileId] = useState<number | null>(null);  //댓글 profile Id
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);  //선택된 profile Id
  const [selectedItem, setSelectedItem] = useState<DiaryModel.IDiaryModel | null>(null);
  
  //일지 리스트
  //TODO: profile api 가져와서 profileId에 넣기
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isRefetching } =
    useInfiniteQuery(
      [QueryKey.DIARY_LIST],
      ({ pageParam = 1 }) => DiaryService.diary.list(1, pageParam, 5),
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalCount = lastPage?.data?.data.totalCount;
          const currentPageDataCount = lastPage?.data?.data.diaries.length;

          if (currentPageDataCount < totalCount) {
            return allPages.length + 1;
          } else {
            return undefined;
          }
        },
      }
    );

  //일지 삭제
  const { mutate: deleteDiaryMutate } = useMutation(
    ({ diaryId, profileId }: { diaryId: number, profileId: number }) =>
      DiaryService.diary.delete(diaryId, profileId),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: "success",
            text1: "삭제되었습니다.",
          });

          setIsFirstVisibleMore(false);
          setIsVisibleDelete(false);
          await queryClient.invalidateQueries([QueryKey.DIARY_LIST]);
          //일지 목록 쿼리를 무효화함
        }
      },
      onError: (error) => {
        console.error("Delete error:", error);
      },
    }
  );

  const diaryData =
    data?.pages.flatMap((page) => page?.data?.data.diaries) ?? [];

  // More 아이콘 클릭 핸들러
  const handlePressMore = (item: DiaryModel.IDiaryModel) => {
    setIsFirstVisibleMore(true);
    setSelectedProfileId(item.profileId);
    setSelectedItem(item);
  };

  // 댓글 아이콘 클릭 핸들러
  const handlePressComment = (item: DiaryModel.IDiaryModel) => {
    getCommentList(item);
    setIsVisibleComment(true);
  };

  // 일지 수정 페이지로 이동
  const handleUpdateDiary = () => {
    if (selectedItem) {
      navigation.navigate(ScreenName.UpdateDiary, { item: selectedItem });
      setIsFirstVisibleMore(false);
    }
  }

  //더보기 모달 footer
  const FooterMore = () => {
    return (
      <View style={styles.bottomModalContainer}>
        <View style={styles.footerTopLine} />
        <View style={[styles.footer, { marginTop: 33 }]}>
          <View style={[styles.buttonContainer, { marginRight: 10 }]}>
            <Pressable
              onPress={handleUpdateDiary}
              style={styles.buttonContainer}
            >
              <Title
                text={"수정"}
                fontSize={16}
                color={Colors.White}
                style={{ textAlign: "center" }}
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
              text={"삭제"}
              fontSize={16}
              color={Colors.White}
              style={{ textAlign: "center" }}
            />
          </Pressable>
        </View>
      </View>
    );
  };


  const getCommentList = async (item: DiaryModel.IDiaryModel) => {
    if (item.commentCount !== 0) {
      setIsComment(true);
    } else {
      setIsComment(false);
    }
    if (item.diaryId !== null && item.profileId !== null) {
      setDiaryId(item.diaryId);
      setProfileId(item.profileId);
    }
  };

  const loadMoreData = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async () => {
    if (selectedItem && selectedProfileId !== null) {
      deleteDiaryMutate({ diaryId: selectedItem.diaryId, profileId: selectedProfileId });
    } else {
      console.log('diary delete error')
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <HeaderNavigation middletitle="일지" hasBackButton={false} />
        <DiaryList
          diaries={diaryData}
          onPressMore={handlePressMore}
          onPressComment={handlePressComment}
          enableActions={true}
          isLoading={isFetchingNextPage}
          onEndReached={loadMoreData}
          refreshing={isRefetching}
          onRefresh={handleRefresh}
        />
        {/* 플로팅 버튼 */}
        <View
          style={[
            styles.floatingButtonContainer,
            {
              backgroundColor: isVisibleMenu
                ? "rgba(0, 0, 0, 0.5)"
                : "transparent",
              zIndex: isVisibleMenu ? 1 : 0,
              top: isVisibleMenu ? 0 : null,
            },
          ]}
        >
          <FloatingButton
            isVisibleMenu={isVisibleMenu}
            onPressCancel={() => setIsVisibleMenu(false)}
            onPressFloating={() => setIsVisibleMenu(!isVisibleMenu)}
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

          <CommentList
            visible={isVisibleComment}
            setIsVisibleComment={setIsVisibleComment}
            diaryId={diaryId ?? 0}
            isComment={isComment}
            profileId={profileId ?? 0}
            setSelectedCommentId={() => {}}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default DiaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  bottomModalContainer: {
    marginTop: 15,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  footerTopLine: {
    backgroundColor: Colors.Gray838383,
    height: 1.5,
    width: 50,
    alignSelf: "center",
  },
  buttonContainer: {
    backgroundColor: Colors.FB3F7E,
    flex: 1,
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
});
