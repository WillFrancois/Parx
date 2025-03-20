import PocketBase from 'pocketbase';

const IPV4 = '192.168.0.40' // replace .x.x with IPV4 digits
export const API_BASE_URL = `http://${IPV4}:5000` 
export const pb = new PocketBase(`http://${IPV4}:8090`)
