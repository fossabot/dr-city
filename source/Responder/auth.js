import firebaseAdmin from 'firebase-admin/lib/default-namespace' // TODO: direct import will result in a smaller pack
import registerFirebaseAdmin from 'firebase-admin/lib/auth/register-auth'

registerFirebaseAdmin()

const initFirebaseAdminApp = (firebaseAdminTokenObject) => firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(firebaseAdminTokenObject) })

const responderAuthVerifyToken = __DEV__
  ? async (store, firebaseAdminApp, authToken) => {
    __DEV__ && console.log('[DEBUG] responderAuthVerifyToken', authToken)
    store.setState({ user: { id: 'DEBUG_USER_ID', name: 'DEBUG_USER_NAME', email: 'DEBUG_USER_EMAIL' } })
  }
  : async (store, firebaseAdminApp, authToken) => {
    const decodedToken = await firebaseAdminApp.auth().verifyIdToken(authToken)
    __DEV__ && console.log('verifyIdToken', decodedToken)
    const { uid, name, email } = decodedToken
    store.setState({ user: { id: uid, name, email } })
  }

export {
  initFirebaseAdminApp,
  responderAuthVerifyToken
}
