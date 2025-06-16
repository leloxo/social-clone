import { User } from "../user/user.model";

export interface RegistrationResponse {
    user: User,
    message: string
}