import Cookies from '../shared/cookies';

export class User {
  username = Cookies.get('nmnd_user_login');
  display_name = Cookies.get('nmnd_user_display_name');
  token = Cookies.get('nmnd_user_access_token');
  id = Cookies.get('nmnd_user_id');
  client = Cookies.get('nmnd_app_client_id');
  profile_image_url = Cookies.get('nmnd_user_avatar');
};
