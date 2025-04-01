import PocketBase from 'pocketbase';

const IPV4 = "192.168.0.40" // replace .x.x with IPV4 digits

export const API_BASE_URL = `http://${IPV4}:5000` 
export const pb = new PocketBase(`http://${IPV4}:8090`)
export const MAPBOX_API_KEY = "pk.eyJ1Ijoic2VhbmRlZXJheSIsImEiOiJjbTh4bmNsdG8wNWdkMnRxM245N3J0NmN6In0.orMbsDxjX-iG7SRA_4C-Ug"

