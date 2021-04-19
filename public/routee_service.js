'use strict';

let constants = {};

self.addEventListener('install', event => {
    console.log("install", event);
    return self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log("activate", event);
    return self.clients.claim();
});

self.addEventListener('push', event => {
    let push = event.data.json();
    console.log('Push', push);
    let notification = push.notification;

    if (typeof notification.data !== 'object' || notification.data === null) {
        notification.data = {}
    }

    if (typeof notification.click_action === 'string') {
        notification.data.url = notification.click_action;
    } else {
        try {
            notification.data.url = push.fcmOptions.link;
        } catch (e) {}
    }

    if ('data' in push && push.data !== null) {
        Object.assign(notification.data, push.data)
    }

    console.log('PushParsed', notification);
    if (Notification.permission === 'granted') {
        event.waitUntil(
          self.registration.showNotification(notification.title, notification)
        );
    }
});

self.addEventListener("fetch", event => {
    console.log("fetch", event);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    console.log('click', event);

    let url = "";

    if (typeof event.notification.data === 'object' && event.notification.data !== null) {
        const campId = (typeof event.notification.data.campaignId === 'string') ? event.notification.data.campaignId : 'null';
        clickEvent(campId);

        if (typeof event.notification.data.url === 'string') {
            url = event.notification.data.url;
        } else {
            try {
                if (typeof event.notification.data.FCM_MSG.fcmOptions.link === 'string')
                    url = event.notification.data.FCM_MSG.fcmOptions.link;
            } catch (e) {}
        }
    }

    if (url !== "") {
        self.clients.openWindow(url).then(
            windowClient => windowClient ? windowClient.focus() : null
        ).catch((e) => {
            console.log("Open url", e)
        });
    } else {
        event.waitUntil(
            self.clients.matchAll({type: 'window'}).then(clientsArr => {
                const focusWindow = clientsArr.some(
                    windowClient => windowClient ? (windowClient.focus(), true) : false
                );

                if (!focusWindow) {
                    self.clients.openWindow('/').then(
                        windowClient => windowClient ? windowClient.focus() : null
                    ).catch((e) => {
                        console.log("Open /", e)
                    });
                }
            })
        );
    }
});

self.addEventListener('notificationclose', event => {
    console.log("close", event);
});

function routeeInitialize(token) {
    constants.token = token;
}

async function clickEvent(campaignId) {
    console.log(constants.token, campaignId)

    /* Save click event */
    /*fetch(
        'https://analytics-service.routee.net/development/click/' + constants.token + '/' + campaignId,
        {headers: {'Content-Type': 'application/json'}}
    ).then(function (response) {
        if (response.status !== 200) {
            console.error('Internal error', response);
        }
    }).catch(function (error) {
        console.error('Internal error', error);
    });*/

    /* In the future service worker will have access to cookies */
    //let routeeCookie = await self.cookieStore.get('routee_cookie');
}