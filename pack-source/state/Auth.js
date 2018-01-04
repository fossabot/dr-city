import { Common } from 'dr-js/module/Dr.browser'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN } from 'config.pack'
import { createStateStore } from 'pack-source/__utils__'

const { createInsideOutPromise } = Common.Function

const initialState = {
  firebaseApp: null,
  user: null
}

const { getState, setState, wrapEntry } = createStateStore(initialState)

const asyncTaskMap = {
  'task:auth:revoke': async (store, action) => {
    const { firebaseApp } = getState()
    if (!firebaseApp) throw new Error('[auth-revoke] no firebaseApp')
    await firebaseApp.auth().signOut()
    store.dispatch({ type: 'reducer:auth:update', payload: { user: null } })
  },
  'task:auth:grant-google': async (store, action) => {
    const { firebaseApp } = getState()
    if (!firebaseApp) throw new Error('[auth-grant-google] no firebaseApp')
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('profile')
    const { user } = await firebaseApp.auth().signInWithPopup(provider).catch(alertLogError)
    store.dispatch({ type: 'reducer:auth:update', payload: { user: parseUser(user) } })
  },
  'task:auth:grant-github': async (store, action) => {
    const { firebaseApp } = getState()
    if (!firebaseApp) throw new Error('[auth-grant-github] no firebaseApp')
    const provider = new firebase.auth.GithubAuthProvider()
    provider.addScope('user:email')
    provider.setCustomParameters({ 'allow_signup': 'false' })
    const { user } = await firebaseApp.auth().signInWithPopup(provider).catch(alertLogError)
    store.dispatch({ type: 'reducer:auth:update', payload: { user: parseUser(user) } })
  }
}

const { promise: initAuthPromise, resolve: initAuthResolve } = createInsideOutPromise()

const getAuthToken = async () => {
  const { firebaseApp } = getState()
  if (!firebaseApp) throw new Error('[getAuthToken] no firebaseApp')
  await initAuthPromise
  const idToken = await firebaseApp.auth().currentUser.getIdToken()
  __DEV__ && console.log('[getAuthToken]', { idToken })
  return idToken
}

const authFetch = async (uri, options = {}) => window.fetch(uri, { ...options, headers: { ...options.headers, 'auth-token': await getAuthToken() } })

const createAuthWebSocket = async (url, protocol) => new window.WebSocket(url, [ protocol, `auth-token!${await getAuthToken()}` ])

const entryMap = {
  'state:auth:init': wrapEntry((state, store) => {
    const firebaseApp = firebase.initializeApp({ apiKey: FIREBASE_API_KEY, authDomain: FIREBASE_AUTH_DOMAIN })

    firebaseApp.auth().onAuthStateChanged((user) => {
      __DEV__ && console.log('onAuthStateChanged', user)
      store.dispatch({ type: 'reducer:auth:update', payload: { user: parseUser(user) } })
      initAuthResolve()
    }, (error) => {
      __DEV__ && console.error('[error] onAuthStateChanged', error)
      asyncTaskMap[ 'task:auth:revoke' ](store).catch(console.warn)
      initAuthResolve()
    })

    store.dispatch({ type: 'reducer:auth:update', payload: { firebaseApp } })
  }),
  'state:auth:revoke': wrapEntry((state, store, action) => {
    asyncTaskMap[ 'task:auth:revoke' ](store, action).catch(console.warn)
  }),
  'state:auth:grant-google': wrapEntry((state, store, action) => {
    asyncTaskMap[ 'task:auth:grant-google' ](store, action).catch(console.warn)
  }),
  'state:auth:grant-github': wrapEntry((state, store, action) => {
    asyncTaskMap[ 'task:auth:grant-github' ](store, action).catch(console.warn)
  })
}

// check: https://firebase.google.com/docs/reference/js/firebase.User
const parseUser = (user) => user ? {
  name: user.displayName || user.providerData[ 0 ].displayName,
  email: user.email,
  avatar: user.photoURL,
  providerId: user.providerData[ 0 ].providerId || user.providerId
} : null

const alertLogError = (error) => {
  __DEV__ && console.error(error)
  window.alert(error.message)
}

export { authFetch, createAuthWebSocket }
export default {
  asyncTaskMap,
  entryMap,
  getState,
  setState
}
