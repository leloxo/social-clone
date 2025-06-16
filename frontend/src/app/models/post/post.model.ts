import { Comment } from "./comment.model";
import { UserSummary } from "../user/user-summary.model";

export interface Post {
    id: number;
    imageUrl: string;
    caption: string;
    createdAt: Date;
    authorSummary: UserSummary;
    comments: Comment[];
    likeCount: number;
    commentCount: number;
    isLiked?: boolean;
    isOwnPost?: boolean;
}