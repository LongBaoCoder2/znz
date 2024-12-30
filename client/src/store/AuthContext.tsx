// @ts-ignore
import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GetProfileResponse, SignInResponse, UserStoreData } from '../axios/interface';
import axios from 'axios';
import getURL from '../axios/network';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Partial<UserStoreData> | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (response: SignInResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Partial<UserStoreData> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get<GetProfileResponse>(getURL("/profile"), {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.data.data) {
        setUser({
          id: response.data.data.id,
          displayName: response.data.data.displayName,
          fullName: response.data.data.fullName,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, tokens might be invalid
      logout();
    }
  };


  const callApiLogout = async () => {
    const response = await axios.post<SignInResponse>(getURL("/auth/logout"), {}, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      },
    });
    return response;
  }

  const checkUser = async () => {
    const existingAccessToken = Cookies.get('accessToken');
    const existingRefreshToken = Cookies.get('refreshToken');
    console.log("AuthContext: ", existingAccessToken, existingRefreshToken);
    if (existingAccessToken && existingRefreshToken) {
      await fetchUserData(existingAccessToken);
      setAccessToken(existingAccessToken);
      setRefreshToken(existingRefreshToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);


  const login = (response: SignInResponse) => {
    setUser(response.user);
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setIsAuthenticated(true);
    
    Cookies.set('accessToken', response.accessToken, { expires: 1 });
    Cookies.set('refreshToken', response.refreshToken, { expires: 1 });
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);

    try {
      const response = await callApiLogout();
      console.log(response);

      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, accessToken, refreshToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
