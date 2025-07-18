export interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp?: string;
    errors?: string[];
}