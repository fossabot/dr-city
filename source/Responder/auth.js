import { Node } from 'dr-js/library/Dr.node'

// TODO: direct import will result in a smaller pack
import firebaseAdmin from 'firebase-admin/lib/default-namespace'
import registerFirebaseAdmin from 'firebase-admin/lib/auth/register-auth'
registerFirebaseAdmin()

const initFirebaseAdmin = (firebaseAdminTokenObject) => firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminTokenObject)
})

const responderAuthVerifyToken = async (store, firebaseAdminApp, authToken) => {
  const decodedToken = await firebaseAdminApp.auth().verifyIdToken(authToken)
  __DEV__ && console.log('verifyIdToken', decodedToken)
  const { uid, name, email } = decodedToken
  store.setState({ user: { id: uid, name, email } })
}

export {
  initFirebaseAdmin,
  responderAuthVerifyToken
}
