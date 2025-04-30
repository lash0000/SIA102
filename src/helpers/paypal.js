import axios from 'axios';

const PAYPAL_API = process.env.PAYPAL_API;
const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_CLIENT_SECRET;

export async function generateAccessToken() {
  const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString('base64');
  const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res.data.access_token;
}
