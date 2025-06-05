import googleServices from '../../../google-services.json';

const firebaseConfig = {
  appId: googleServices.client[0].client_info.mobilesdk_app_id,
  apiKey: googleServices.client[0].api_key[0].current_key,
  projectId: googleServices.project_info.project_id,
  storageBucket: googleServices.project_info.storage_bucket,
  messagingSenderId: googleServices.project_info.project_number,
};

export default firebaseConfig;