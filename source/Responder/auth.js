import { FirebaseTokenGenerator } from 'firebase-admin/lib/auth/token-generator' // TODO: direct import will result in a much smaller pack
import { Certificate } from 'firebase-admin/lib/auth/credential' // TODO: direct import will result in a much smaller pack

const initFirebaseAdminApp = (firebaseAdminTokenObject) => {
  // TODO: should be: firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(firebaseAdminTokenObject) })
  const firebaseTokenGenerator = new FirebaseTokenGenerator(new Certificate(firebaseAdminTokenObject))
  return { verifyIdToken: (authToken) => firebaseTokenGenerator.verifyIdToken(authToken) }
}

const responderAuthVerifyToken = __DEV__
  ? async (store, firebaseAdminApp, authToken) => {
    __DEV__ && console.log('[DEBUG] responderAuthVerifyToken', authToken)
    store.setState({ user: { id: 'DEBUG_USER_ID', name: 'DEBUG_USER_NAME', email: 'DEBUG_USER_EMAIL' } })
  }
  : async (store, firebaseAdminApp, authToken) => {
    // TODO: should be: const decodedToken = await firebaseAdminApp.auth().verifyIdToken(authToken)
    const decodedToken = await firebaseAdminApp.verifyIdToken(authToken)
    __DEV__ && console.log('verifyIdToken', decodedToken)
    const { uid, name, email } = decodedToken
    store.setState({ user: { id: uid, name, email } })
  }

export {
  initFirebaseAdminApp,
  responderAuthVerifyToken
}
