document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');

    // Is Client ID ko hum agle step mein haasil karenge.
    const GITHUB_CLIENT_ID = 'Ov23lidYEHoePntcBamC';

    const loginUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,user:email`;

    loginButton.setAttribute('href', loginUrl );
});
