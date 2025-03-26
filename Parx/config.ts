import PocketBase from 'pocketbase';

const IPV4 = "192.168.1.46" // replace .x.x with IPV4 digits

export const API_BASE_URL = `http://${IPV4}:5000` 
export const pb = new PocketBase(`http://${IPV4}:8090`)
export const MAPBOX_API_KEY = "pk.eyJ1Ijoic2VhbmRlZXJheSIsImEiOiJjbThxNjc1ajgwamt5MmlxNGFzdzI1Z2VtIn0.ljLsXjL7EdvxStUvcOPfIg"

