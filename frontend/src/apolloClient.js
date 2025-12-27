import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Determine API URL: 
// - Use env variable if set
// - In development (localhost with dev port), use full URL to API Gateway
// - In production (Docker), use relative path (nginx will proxy)
const getApiUrl = () => {
  // Priority 1: Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Check if we're running in development mode
  // Vite sets import.meta.env.DEV to true in development
  // In production build, it's false
  if (import.meta.env.DEV) {
    // Development mode: direct connection to API Gateway on port 4000
    return 'http://localhost:4000/graphql';
  }
  
  // Production mode (Docker): use relative path (nginx will proxy to api-gateway:4000)
  return '/graphql';
};

const apiUrl = getApiUrl();
console.log('🔗 Apollo Client connecting to:', apiUrl);

const httpLink = createHttpLink({
  uri: apiUrl,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;