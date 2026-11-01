window.addEventListener('error', function (event) {
    console.error('An error occurred:', event.message, 'at', event.filename + ':' + event.lineno);
});

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
});
