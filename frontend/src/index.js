import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/userContext';
import './styles.css';
import { Provider } from 'react-redux';
import { store } from './contexts/store';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'} > 
          <UserProvider>
            <App />
          </UserProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
