const ACCESS_TOKEN_KEY = 'pawHoodAT';
const REFRESH_TOKEN_KEY = 'pawHoodRAT';

export const getAccessToken = () => getTokenWithExpiry(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => getTokenWithExpiry(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
    console.log(`Byeeeeee ${accessToken} ${refreshToken}`)
  if (accessToken) setTokenWithExpiry(ACCESS_TOKEN_KEY, accessToken, 2592900);
  if (refreshToken) setTokenWithExpiry(REFRESH_TOKEN_KEY, refreshToken, 2592900 * 6);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setTokenWithExpiry = (key, token, ttlInSeconds) => {
    console.log(`Hiiii11 ${key} ${token} ${ttlInSeconds}`)
    const now = new Date();
    const item = {
      token,
      expiry: now.getTime() + ttlInSeconds * 1000 + 10,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

export const getTokenWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
  
    try {
      const item = JSON.parse(itemStr);
      const now = new Date();
  
      if (now.getTime() > item.expiry) {
        // Token expired
        localStorage.removeItem(key);
        return null;
      }
  
      return item.token;
    } catch (e) {
      return null;
    }
  };
  
