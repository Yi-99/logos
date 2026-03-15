import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const hostedUiDomain = import.meta.env.VITE_COGNITO_DOMAIN;

if (!userPoolId || !clientId) {
  throw new Error('Missing Cognito environment variables. Check VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID.');
}

const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

export interface CognitoAuthUser {
  id: string;
  email: string;
  name: string;
}

function parseCognitoUser(session: CognitoUserSession, cognitoUser: CognitoUser): Promise<CognitoAuthUser> {
  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err, attributes) => {
      if (err) return reject(err);
      const attr = (name: string) => attributes?.find(a => a.getName() === name)?.getValue() || '';
      resolve({
        id: attr('sub'),
        email: attr('email'),
        name: attr('name') || attr('email'),
      });
    });
  });
}

export function signIn(email: string, password: string): Promise<CognitoAuthUser> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (session) => {
        try {
          const user = await parseCognitoUser(session, cognitoUser);
          resolve(user);
        } catch (e) {
          reject(e);
        }
      },
      onFailure: reject,
    });
  });
}

export function signUp(email: string, password: string, fullName: string): Promise<void> {
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'name', Value: fullName }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function signInWithGoogle(): void {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const url =
    `${hostedUiDomain}/oauth2/authorize?` +
    `response_type=code&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid+email+profile` +
    `&identity_provider=Google`;
  window.location.href = url;
}

export function handleOAuthCallback(code: string): Promise<CognitoAuthUser> {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const tokenUrl = `${hostedUiDomain}/oauth2/token`;

  return fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Token exchange failed');
      return res.json();
    })
    .then(tokens => {
      // Parse the ID token to get user info
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
      };
    });
}

export function getCurrentUser(): Promise<CognitoAuthUser | null> {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return Promise.resolve(null);

  return new Promise((resolve) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      parseCognitoUser(session, cognitoUser).then(resolve).catch(() => resolve(null));
    });
  });
}

export function getAccessToken(): Promise<string | null> {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return Promise.resolve(null);

  return new Promise((resolve) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}

export function signOut(): void {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

export function forgotPassword(email: string): Promise<void> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: reject,
    });
  });
}

export function confirmNewPassword(email: string, code: string, newPassword: string): Promise<void> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: reject,
    });
  });
}
