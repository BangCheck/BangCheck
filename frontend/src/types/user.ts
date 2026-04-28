export interface User {
  id: string;
  email: string;
  nickname?: string;
  profileImage?: string;
  profileImageUrl?: string;
}

export type OAuthProvider = 'google' | 'naver';
