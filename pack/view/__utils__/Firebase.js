import { Common } from 'dr-js/module/Dr.browser'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { firebaseApiKey as apiKey, firebaseAuthDomain as authDomain } from 'option'

const { Immutable: { createStateStore } } = Common

const ROUTE_AUTH_CHECK = '/auth-check'

const initialState = {
  isInit: false,
  user: null,
  authCheckResultText: ''
}

const createFirebaseAuth = (stateStore = createStateStore(initialState)) => {
  const firebaseApp = firebase.initializeApp({ apiKey, authDomain })

  firebaseApp.auth().onAuthStateChanged((userInfo) => {
    __DEV__ && console.log('onAuthStateChanged', userInfo)
    stateStore.setState({ user: userInfo ? userInfo.providerData[ 0 ] : null, isInit: true })
  }, (error) => {
    __DEV__ && console.error('[error] onAuthStateChanged', error)
    doAuthRevoke()
  })

  const authFetch = (uri, options = {}) => firebaseApp.auth().currentUser.getIdToken()
    .then((idToken) => window.fetch(uri, { ...options, headers: { ...options.headers, 'auth-token': idToken } }))

  const doAuthGrantGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('profile')
    firebaseApp.auth().signInWithPopup(provider)
    // .then((result) => { __DEV__ && console.log(`auth granted`) })
      .catch(alertLogError)
  }
  const doAuthGrantGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider()
    provider.addScope('user:email')
    provider.setCustomParameters({ 'allow_signup': 'false' })
    firebaseApp.auth().signInWithPopup(provider)
    // .then((result) => { __DEV__ && console.log(`auth granted, GitHub Access Token ${result.credential.accessToken}`) })
      .catch(alertLogError)
  }
  const doAuthRevoke = () => {
    firebaseApp.auth().signOut()
    stateStore.setState(initialState)
  }
  const doAuthCheck = () => authFetch(ROUTE_AUTH_CHECK).then((result) => result.text())
    .then((resultText) => stateStore.setState({ authCheckResultText: resultText }))
    .catch(alertLogError)

  return { stateStore, doAuthGrantGoogle, doAuthGrantGithub, doAuthRevoke, doAuthCheck }
}

const alertLogError = (error) => {
  __DEV__ && console.error(error)
  window.alert(error.message)
}

export { createFirebaseAuth }
