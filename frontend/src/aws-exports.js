/* eslint-disable */
const env = window._env_ || {};

const awsmobile = {
  aws_project_region: env.VITE_AWS_REGION,
  aws_cognito_identity_pool_id: env.VITE_AWS_IDENTITY_POOL_ID,
  aws_cognito_region: env.VITE_AWS_COGNITO_REGION,
  aws_user_pools_id: env.VITE_AWS_USER_POOL_ID,
  aws_user_pools_web_client_id: env.VITE_AWS_APP_CLIENT_ID,
  oauth: {
    domain: env.VITE_AWS_COGNITO_DOMAIN,
    scope: [
      "phone",
      "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin",
    ],
    redirectSignIn: env.VITE_AWS_REDIRECT_SIGNIN,
    redirectSignOut: env.VITE_AWS_REDIRECT_SIGNOUT,
    responseType: "code",
  },
  federationTarget: "COGNITO_USER_POOLS",
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ["EMAIL"],
};

export default awsmobile;
