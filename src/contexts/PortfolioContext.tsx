import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types for the portfolio data
export interface Skill {
  id: string;
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  image: string;
  credentialUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  publishDate: string;
  tags: string[];
  featured: boolean;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  imageProfile: string;
  profilepic: string;
  homeimage: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface PortfolioState {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  blogs: BlogPost[];
  isAuthenticated: boolean;
}

// Action types
type PortfolioAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'UPDATE_SKILL'; payload: Skill }
  | { type: 'DELETE_SKILL'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_CERTIFICATE'; payload: Certificate }
  | { type: 'UPDATE_CERTIFICATE'; payload: Certificate }
  | { type: 'DELETE_CERTIFICATE'; payload: string }
  | { type: 'ADD_BLOG'; payload: BlogPost }
  | { type: 'UPDATE_BLOG'; payload: BlogPost }
  | { type: 'DELETE_BLOG'; payload: string }
  | { type: 'SET_AUTH'; payload: boolean };

// Initial state with empty data
const initialState: PortfolioState = {
  profile: {
    name: '',
    title: '',
    bio: '',
    imageProfile: '',
    profilepic: '',
    homeimage: '',
    email: '',
    phone: '',
    location: '',
    resumeUrl: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      website: ''
    }
  },
  skills: [],
  projects: [],
  certificates: [],
  blogs: [],
  isAuthenticated: false
};

// Reducer function
function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload }
      };
    case 'ADD_SKILL':
      return {
        ...state,
        skills: [...state.skills, action.payload]
      };
    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map(skill => 
          skill.id === action.payload.id ? action.payload : skill
        )
      };
    case 'DELETE_SKILL':
      return {
        ...state,
        skills: state.skills.filter(skill => skill.id !== action.payload)
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    case 'ADD_CERTIFICATE':
      return {
        ...state,
        certificates: [...state.certificates, action.payload]
      };
    case 'UPDATE_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.map(cert => 
          cert.id === action.payload.id ? action.payload : cert
        )
      };
    case 'DELETE_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.filter(cert => cert.id !== action.payload)
      };
    case 'ADD_BLOG':
      return {
        ...state,
        blogs: [...state.blogs, action.payload]
      };
    case 'UPDATE_BLOG':
      return {
        ...state,
        blogs: state.blogs.map(blog => 
          blog.id === action.payload.id ? action.payload : blog
        )
      };
    case 'DELETE_BLOG':
      return {
        ...state,
        blogs: state.blogs.filter(blog => blog.id !== action.payload)
      };
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: action.payload
      };
    default:
      return state;
  }
}

// Context creation
const PortfolioContext = createContext<{
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
} | null>(null);

// Provider component
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Custom hook to use the context
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}