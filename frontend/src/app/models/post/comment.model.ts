import { UserSummary } from "../user/user-summary.model";

export interface Comment {
    id: number;
    content: string;
    createdAt: Date;
    authorSummary: UserSummary;
    isOwnComment?: boolean;
}
  