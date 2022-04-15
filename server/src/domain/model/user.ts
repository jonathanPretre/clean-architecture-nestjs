export class UserWithoutPassword {
  id: number;
  username: string;
  createDate: Date;
  updatedDate: Date;
  lastLogin: Date;
  hashRefreshToken: string;

  constructor() {}
}

export class UserM extends UserWithoutPassword {
  password: string;
}
