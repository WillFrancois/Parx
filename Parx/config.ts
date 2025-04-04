import PocketBase from 'pocketbase';

const IPV4 = "192.168.x.x" // replace .x.x with IPV4 digits

export const API_BASE_URL = `http://${IPV4}:5000` 
export const pb = new PocketBase(`http://${IPV4}:8090`)
export const MAPBOX_API_KEY = "enter API key"

export const STRIPE_PK = "pk_test_51R1Ee5JfOX4Y0nqUuDEPVaVYFhyP6NkNUDVLquYhTG5e79QHjiIbkVNiVZV7SgsAhaUWkZLfPvxgagj7FYKyBsUf00dzrSUUDw";