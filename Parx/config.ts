import PocketBase from 'pocketbase';

const IPV4 = "192.168.x.x" // replace .x.x with IPV4 digits

export const API_BASE_URL = `http://${IPV4}:5000` 
export const pb = new PocketBase(`http://${IPV4}:8090`)
export const MAPBOX_API_KEY = "pk.eyJ1Ijoic2VhbmRlZXJheSIsImEiOiJjbTgxMzBqeTcweWd6MmlwdWgzaDBmd2Z0In0.BvER_lMJy1JwbxA127OHTQ"

