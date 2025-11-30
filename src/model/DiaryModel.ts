export namespace DiaryModel {
	export interface IDiaryTotalModel {
		data: {
			data: {
			  diaries: IDiaryModel
			  totalCount: number
			},
		},
	}

	export interface IMediaItem {
		id: number
		order: number
		type: 'V' | 'I'  // V: Video, I: Image
		url: string
	}

	export interface IDiaryModel {
		commentCount: number
		content: string
		createdAt: string
		diaryId: number
		imageUrl?: string
		media: Array<IMediaItem>
		name: string
		profileId: number
		likeYn: boolean
	}

	export interface IDiaryCommentModel {
		commentId: number
		content: string
		createdAt: string
		profileId: number
		name: string
		imageUrl: string
		replyCount: number
	}

	export interface IDiaryReplyModel {
		replyId: number
		content: string
		createdAt: string
		profileId: number
		name: string
		imageUrl: string
	}

	// 캘린더 API 관련 타입들
	export interface IDiaryCalendarItem {
		diaryId: number
		content: string
		createdAt: string
		profileId: number
		name: string
		imageUrl: string
	}

	export interface IDiaryCalendarData {
		totalCount: number
		diaries: IDiaryCalendarItem[]
	}

	export interface IDiaryCalendarResponse {
		success: boolean
		data: IDiaryCalendarData
		error: {
			code: string
			message: string
		}
	}
}