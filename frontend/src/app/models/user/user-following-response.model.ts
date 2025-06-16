import { UserSummary } from "./user-summary.model";

export interface UserFollowingResponse {
    userId: number,
    following: UserSummary[],
    count: number
}