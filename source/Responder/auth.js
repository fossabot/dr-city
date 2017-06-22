import { Node } from 'dr-js/library/Dr.node'

// TODO: direct import will result in a smaller pack
import firebaseAdmin from 'firebase-admin/lib/default-namespace'
import registerFirebaseAdmin from 'firebase-admin/lib/auth/register-auth'
registerFirebaseAdmin()

const {
  createResponseReducerReceiveBuffer
} = Node.Server.ResponseReducer

const initFirebaseAdmin = (firebaseAdminTokenObject) => firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminTokenObject)
})

const responseReducerReceiveIDTokenBuffer = createResponseReducerReceiveBuffer((store, buffer) => store.setState({ idToken: buffer.toString() }))

const responseReducerAuthVerifyToken = (store, firebaseAdminApp) => responseReducerReceiveIDTokenBuffer(store)
  .then(() => firebaseAdminApp.auth().verifyIdToken(store.request.headers[ 'auth-token' ]))
  .then((decodedToken) => {
    __DEV__ && console.log('verifyIdToken', decodedToken)
    const { uid, name, email } = decodedToken
    store.setState({ user: { id: uid, name, email } })
    return store
  })
  .catch((error) => {
    __DEV__ && console.warn('error', error)
    throw error
  })

export {
  initFirebaseAdmin,
  responseReducerAuthVerifyToken
}
