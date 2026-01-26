const config = {
  // REQUIRED
  appName: 'ShareSkippy',
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    'ShareSkippy - Connecting dog lovers with dog owners for free, community-based dog sharing experiences.',
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: 'shareskippy.com',
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: '',
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ['/'],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: 'bucket-name',
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: 'https://cdn-id.cloudfront.net/',
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links (no replies expected)
    fromNoReply: `ShareSkippy <noreply@send.shareskippy.com>`,
    // REQUIRED — Email 'From' field for emails that might get replies (forwarded to Gmail)
    fromAdmin: `ShareSkippy <admin@send.shareskippy.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: 'support@shareskippy.com',
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: '/signin',
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: '/community',
  },
};

export default config;
