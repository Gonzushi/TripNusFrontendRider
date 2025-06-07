import Env from '@env';

import developmentGoogleServices from '../../../google-services.development.json';
import productionGoogleServices from '../../../google-services.production.json';
import stagingGoogleServices from '../../../google-services.staging.json';

const APP_ENV = Env.APP_ENV;

let googleServices;

if (APP_ENV === 'production') {
  googleServices = productionGoogleServices;
} else if (APP_ENV === 'staging') {
  googleServices = stagingGoogleServices;
} else {
  // default to development
  googleServices = developmentGoogleServices;
}

const firebaseConfig = {
  appId: googleServices.client[0].client_info.mobilesdk_app_id,
  apiKey: googleServices.client[0].api_key[0].current_key,
  projectId: googleServices.project_info.project_id,
  storageBucket: googleServices.project_info.storage_bucket,
  messagingSenderId: googleServices.project_info.project_number,
};

export default firebaseConfig;
