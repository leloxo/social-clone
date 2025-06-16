import { Post } from "./post.model";

export interface CommentResponse {
    postId: number,
    commentCount: number,
    postDetails: Post
}