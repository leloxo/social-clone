export interface User {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
    profileImageUrl?: string;
    biography?: string;
}
  