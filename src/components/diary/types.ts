import { DiaryModel } from '../../model/DiaryModel';

/**
 * DiaryItem 컴포넌트 Props
 */
export interface DiaryItemProps {
    /** 일지 데이터 */
    item: DiaryModel.IDiaryModel;
    /** More 아이콘 클릭 핸들러 (수정/삭제) */
    onPressMore?: (item: DiaryModel.IDiaryModel) => void;
    /** 댓글 아이콘 클릭 핸들러 */
    onPressComment?: (item: DiaryModel.IDiaryModel) => void;
    /** 액션 버튼 활성화 여부 (More, 댓글 클릭 가능 여부) */
    enableActions?: boolean;
    /** 하단 구분선 표시 여부 */
    showSeparator?: boolean;
    /** 아이템 인덱스 (구분선 표시 로직용) */
    index?: number;
    /** 전체 아이템 개수 (마지막 아이템 판단용) */
    totalCount?: number;
}

/**
 * DiaryList 컴포넌트 Props
 */
export interface DiaryListProps {
    /** 일지 목록 데이터 */
    diaries: DiaryModel.IDiaryModel[];
    /** More 아이콘 클릭 핸들러 */
    onPressMore?: (item: DiaryModel.IDiaryModel) => void;
    /** 댓글 아이콘 클릭 핸들러 */
    onPressComment?: (item: DiaryModel.IDiaryModel) => void;
    /** 액션 버튼 활성화 여부 */
    enableActions?: boolean;
    /** 로딩 상태 */
    isLoading?: boolean;
    /** 무한 스크롤 핸들러 */
    onEndReached?: () => void;
    /** 빈 목록 컴포넌트 */
    ListEmptyComponent?: React.ReactNode;
    /** FlatList 스타일 커스터마이징 */
    contentContainerStyle?: object;
    /** Pull-to-Refresh 새로고침 중 상태 */
    refreshing?: boolean;
    /** Pull-to-Refresh 핸들러 */
    onRefresh?: () => void;
}

/**
 * DiaryFormEditor 컴포넌트 Props
 */
export interface DiaryFormEditorProps {
    /** 초기 콘텐츠 (수정 모드일 때) */
    initialContent?: string;
    /** 초기 이미지 URL 목록 */
    initialImageUrls?: string[];
    /** 제출 핸들러 */
    onSubmit: (content: string, imageUrls: string[]) => Promise<void> | void;
    /** 제출 버튼 텍스트 */
    submitButtonText: string;
    /** 헤더 타이틀 */
    headerTitle: string;
    /** 뒤로가기 핸들러 */
    onBack?: () => void;
}

/**
 * DiaryActionModal 컴포넌트 Props
 */
export interface DiaryActionModalProps {
    /** 모달 표시 여부 */
    isVisible: boolean;
    /** 모달 닫기 핸들러 */
    onClose: () => void;
    /** 수정 핸들러 */
    onEdit: () => void;
    /** 삭제 핸들러 */
    onDelete: () => void;
    /** 삭제 확인 모달 표시 여부 */
    showDeleteConfirm?: boolean;
    /** 삭제 확인 모달 열기 핸들러 */
    onOpenDeleteConfirm?: () => void;
    /** 삭제 확인 모달 닫기 핸들러 */
    onCloseDeleteConfirm?: () => void;
}
