import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { DiaryModel } from '../../model/DiaryModel';
import { DiaryListProps } from './types';
import { diaryStyles } from './styles';
import DiaryItem from './DiaryItem';

/**
 * 일지 목록 컴포넌트
 */
const DiaryList: React.FC<DiaryListProps> = ({
    diaries,
    onPressMore,
    onPressComment,
    enableActions = true,
    isLoading = false,
    onEndReached,
    ListEmptyComponent,
    contentContainerStyle,
    refreshing = false,
    onRefresh,
}) => {
    const renderItem = ({ item, index }: { item: DiaryModel.IDiaryModel; index: number }) => (
        <DiaryItem
            item={item}
            onPressMore={onPressMore}
            onPressComment={onPressComment}
            enableActions={enableActions}
            showSeparator={true}
            index={index}
            totalCount={diaries.length}
        />
    );

    const renderEmptyComponent = () => {
        if (ListEmptyComponent) {
            return <>{ListEmptyComponent}</>;
        }

        if (isLoading) {
            return (
                <View style={diaryStyles.centerContainer}>
                    <Text style={diaryStyles.messageText}>로딩 중...</Text>
                </View>
            );
        }

        return (
            <View style={diaryStyles.centerContainer}>
                <Text style={diaryStyles.messageText}>일지가 없습니다.</Text>
            </View>
        );
    };

    return (
        <FlatList
            style={diaryStyles.flatList}
            contentContainerStyle={contentContainerStyle || diaryStyles.flatListContent}
            data={diaries}
            renderItem={renderItem}
            keyExtractor={(item, index) => `diary-${item?.diaryId}-${index}`}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.6}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }
        />
    );
};

export default DiaryList;
