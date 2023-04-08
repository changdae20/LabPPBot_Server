import { User } from './db/user.model';
import { Request } from 'express';

export interface CustomRequest extends Request {
    token: string|undefined;
    user: User|null;
    setUser: (user: User|null) => Promise<any>;

    session: any;
    data: any;
    photo: any;
    audio: any;
}

export type Resolver = (value?: unknown) => void;

export const ADMIN_LEVEL = {
    USER: 0,
    ADMIN: 1,
};