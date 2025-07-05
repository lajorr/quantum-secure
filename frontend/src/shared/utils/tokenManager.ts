// Token management utility
let accessToken: string | null = null;
let tokenUpdateCallback: ((token: string | null) => void) | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
  // Notify AuthContext if callback is set
  if (tokenUpdateCallback) {
    tokenUpdateCallback(token);
  }
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
  // Notify AuthContext if callback is set
  if (tokenUpdateCallback) {
    tokenUpdateCallback(null);
  }
};

export const setTokenUpdateCallback = (callback: (token: string | null) => void) => {
  tokenUpdateCallback = callback;
};

export const removeTokenUpdateCallback = () => {
  tokenUpdateCallback = null;
}; 