const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ID = 'bytebrief-19bc3';
const COLLECTION = 'pushSubscriptions';
const dryRun = process.argv.includes('--dry-run');
const VAPID_PUBLIC_KEY = fs
  .readFileSync(path.join(__dirname, '..', 'js', 'vapid.js'), 'utf8')
  .match(/export const UPDATE_ALERT_PUBLIC_KEY = "([^"]+)"/)?.[1];

if (!VAPID_PUBLIC_KEY) {
  console.error('Could not read js/vapid.js');
  process.exit(1);
}

let admin;
let webpush;
try {
  admin = require('firebase-admin');
  webpush = require('web-push');
} catch (error) {
  console.error(
    'Install the sender dependencies first: npm install --no-save firebase-admin web-push'
  );
  console.error(error.message);
  process.exit(1);
}

const privateKey = process.env.WEBPUSH_VAPID_PRIVATE_KEY;
if (!privateKey) {
  console.error(
    'Set WEBPUSH_VAPID_PRIVATE_KEY before running this script. The matching private key was kept outside the repository.'
  );
  process.exit(1);
}

webpush.setVapidDetails('mailto:ibbuweb@gmail.com', VAPID_PUBLIC_KEY, privateKey);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID
});

const db = admin.firestore();

const payload = {
  title: 'ByteBrief got an update',
  body: 'Cleaner cards, text-first stories, and a smoother Saved page. Tap to see.',
  url: 'https://ibbuweb.github.io/ByteBrief/?source=update',
  icon: 'https://ibbuweb.github.io/ByteBrief/assets/icon-192.png'
};

async function main() {
  const snapshot = await db.collection(COLLECTION).get();
  const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(
    `${dryRun ? 'Would send' : 'Sending'} to ${subscriptions.length} subscription(s).`
  );

  let sent = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
      failed += 1;
      continue;
    }

    const webPushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    if (dryRun) {
      sent += 1;
      continue;
    }

    try {
      await webpush.sendNotification(webPushSubscription, JSON.stringify(payload));
      sent += 1;
    } catch (error) {
      failed += 1;
      if (error.statusCode === 410 || error.statusCode === 404) {
        await db.collection(COLLECTION).doc(subscription.id).delete();
      }
    }
  }

  console.log(`Done: ${sent} sent, ${failed} failed.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
