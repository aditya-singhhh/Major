import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1', // Change to your desired region
  accessKeyId: 'AKIAXZEFIHPDJZ22WC4F',// Replace with your Access Key ID
  secretAccessKey: 'tE5+/M9MDI1YFIKrKt59mIHof7RUaqKQAs3dIPbh',// Replace with your Secret Access Key
});

// You can also use Cognito Identity Pool for authentication
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: 'YOUR_COGNITO_IDENTITY_POOL_ID',
// });

const s3 = new AWS.S3();
export default s3;
