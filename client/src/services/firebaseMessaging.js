// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // Your Firebase configuration
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { notification } = payload;
  const options = {
    body: notification.body,
    icon: notification.icon,
  };

  self.registration.showNotification(notification.title, options);
});