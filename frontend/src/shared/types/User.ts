interface UserBase {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
}

export type User = UserBase & {
  priv_key: string;
};

export type Friend = UserBase & {
  pub_key: string;
};
