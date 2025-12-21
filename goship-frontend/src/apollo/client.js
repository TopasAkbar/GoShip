import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Auth link to inject JWT token
const createAuthLink = (uri) => {
  const httpLink = new HttpLink({ uri });

  const authLink = setContext((_, { headers }) => {
    const token = getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return from([authLink, httpLink]);
};

// Public links (no auth required)
const tariffLink = new HttpLink({
  uri: import.meta.env.VITE_TARIFF_API || 'http://localhost:4001/graphql',
});

const trackingLink = new HttpLink({
  uri: import.meta.env.VITE_TRACKING_API || 'http://localhost:4002/graphql',
});

// Auth Service (no auth required for login/register)
const authLink = new HttpLink({
  uri: import.meta.env.VITE_AUTH_API || 'http://localhost:4007/graphql',
});

// Protected links (require JWT)
const courierLink = createAuthLink(
  import.meta.env.VITE_COURIER_API || 'http://localhost:4003/graphql'
);

const areaLink = createAuthLink(
  import.meta.env.VITE_AREA_API || 'http://localhost:4004/graphql'
);

const manifestLink = createAuthLink(
  import.meta.env.VITE_MANIFEST_API || 'http://localhost:4005/graphql'
);

const analyticsLink = createAuthLink(
  import.meta.env.VITE_ANALYTICS_API || 'http://localhost:4006/graphql'
);

// Create Apollo Clients for each service
export const authClient = new ApolloClient({
  link: from([authLink]),
  cache: new InMemoryCache(),
});

export const tariffClient = new ApolloClient({
  link: from([tariffLink]),
  cache: new InMemoryCache(),
});

export const trackingClient = new ApolloClient({
  link: from([trackingLink]),
  cache: new InMemoryCache(),
});

export const courierClient = new ApolloClient({
  link: courierLink,
  cache: new InMemoryCache(),
});

export const areaClient = new ApolloClient({
  link: areaLink,
  cache: new InMemoryCache(),
});

export const manifestClient = new ApolloClient({
  link: manifestLink,
  cache: new InMemoryCache(),
});

export const analyticsClient = new ApolloClient({
  link: analyticsLink,
  cache: new InMemoryCache(),
});

// Default client (can be used for general queries)
export const defaultClient = tariffClient;

