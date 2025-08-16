import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/auth';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return result;
    }

    // Try refresh token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      const { accessToken, refreshToken: newRefreshToken } = refreshResult.data;
      setTokens({ accessToken, refreshToken: newRefreshToken });

      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      clearTokens();
      window.location.href = '/login';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}), // extend later
});
