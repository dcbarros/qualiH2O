import { api } from "../../lib/axios";

export type SignInRequest = { username: string; password: string };
export type SignInResponse = {
  username: string;
  authenticated: boolean;
  created: string;
  expiration: string;
  accessToken: string;
};

export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  const res = await api.post("/api/v1/auth/signin", data);
  return res.data;
}