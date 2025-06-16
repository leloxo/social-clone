import { UserSummary } from "./user-summary.model";

export interface UserFollowersResponse {
    userId: number,
    followers: UserSummary[],
    count: number
}