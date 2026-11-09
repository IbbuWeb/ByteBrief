import { auth, db } from './firebase-config.js?v=20261109-4';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { UPDATE_ALERT_PUBLIC_KEY, UPDATE_ALERT_VERSION } from './vapid.js?v=20261109-4';

const UPDATE_ALERT_DISMISSED_KEY = `bytebrief_update_alerts_${UPDATE_ALERT_VERSION}_dismissed`;

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(base64);
  const result = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    result[i] = binary.charCodeAt(i);
  }
  return result;
}

export function canEnableUpdateAlerts() {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export async function enableUpdateAlerts() {
  if (!canEnableUpdateAlerts()) {
    throw new Error('Notifications are not supported in this browser.');
  }

  const permission = await window.Notification.requestPermission();
  if (permission !== 'granted') {
    return { permission, subscribed: false };
  }

  const registration = await navigator.serviceWorker.register(
    new URL('sw.js', document.baseURI).toString(),
    { scope: new URL('./', document.baseURI).pathname, updateViaCache: 'none' }
  );
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(UPDATE_ALERT_PUBLIC_KEY)
    });
  }
  const json = subscription.toJSON();
  if (!json?.endpoint || !json?.keys?.p256dh || !json?.keys?.auth) {
    throw new Error('The browser did not provide a push subscription.');
  }

  try {
    await addDoc(collection(db, 'pushSubscriptions'), {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(
      'Update alerts are on in this browser, but ByteBrief could not save your subscription. Please try again after the site updates.'
    );
  }

  try {
    localStorage.setItem(UPDATE_ALERT_DISMISSED_KEY, 'true');
  } catch {}

  return { permission, subscribed: true };
}

