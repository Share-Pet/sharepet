import { apiSlice } from './contexts/apiSlice';

export const loginApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/v1/auth/google',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation } = loginApi;
