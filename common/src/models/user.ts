import { IId } from './base-models';

export interface IUserAttrs {
  email: string;
  password: string;
};

export interface IUser extends IId, IUserAttrs {};
