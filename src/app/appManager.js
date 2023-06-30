let newWorker;

function showUpdateBar() {
    let snackbar = document.createElement ('div');
    snackbar.setAttribute ('id', 'snackbar');
    snackbar.innerHTML = '<span>Nova versão disponível.</span> <a href="#" id="reload">ATUALIZANDO</a>'
    document.body.appendChild (snackbar);
    snackbar.className = 'show';
    console.log ('Updating PWA...')
    // newWorker.postMessage ({ action: 'skipWaiting' });
}

// The click event on the pop up notification
// document.getElementById ('reload').addEventListener ('click', function() {
//     newWorker.postMessage ({ action: 'skipWaiting' });
// });

if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register ('serviceWorker.js').then(reg => {
        reg.addEventListener ('updatefound', () => {
        // A wild service worker has appeared in reg.installing!
            newWorker = reg.installing;

            newWorker.addEventListener ('statechange', () => {
                // Has network.state changed?
                switch (newWorker.state) {
                    case 'installed':
                        if (navigator.serviceWorker.controller) {
                            // new update available
                            showUpdateBar();
                        }
                        // No update available
                        break;
                }
            });
        });
    });

    let refreshing;
    navigator.serviceWorker.addEventListener ('controllerchange', function () {
        if (refreshing) return;

        window.location.reload ();

        refreshing = true;
    });
}
