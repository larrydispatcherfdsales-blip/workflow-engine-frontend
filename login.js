document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');

    // Yeh Client ID humein GitHub se milti hai jab hum OAuth App banate hain.
    // Aapko yeh apni app ki ID se replace karna hoga.
    const GITHUB_CLIENT_ID = 'YAHAN_APNI_GITHUB_OAUTH_APP_CLIENT_ID_DAALEIN';

    // User ko GitHub ke authorization page par bhejna
    const loginUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,user:email`;

    loginButton.setAttribute('href', loginUrl );
});
