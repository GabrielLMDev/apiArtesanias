const admin = require('firebase-admin');
/* const serviceAccount = require('./sdk/adminsdk-main.json'); */
require('dotenv').config();

/* admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}); */

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FB_PROJECT_ID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    private_key_id: process.env.FB_PRIVATE_KEY_ID,
    client_id: process.env.FB_CLIENT_ID,
    auth_uri: process.env.FB_AUTH_URI,
    token_uri: process.env.FB_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FB_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FB_UNIVERSE_DOMAIN
  }),
});

const db = admin.firestore();

module.exports = { db };
