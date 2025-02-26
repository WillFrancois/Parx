# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



# Expo Router in React Native

Expo Router is a new routing library for React Native, providing an easier way to manage navigation in your app, especially when working with Expo. It simplifies the creation of routes using a file-based routing system, similar to how Next.js works for web applications.

## How Expo Router Works

### 1. File-based Routing
The routing system is built around a file structure. In Expo Router, pages are created by adding components inside a `app/` directory, and the file names determine the routes automatically.

For example, if you create a file `app/home.js`, it will automatically correspond to the `/home` route.

### 2. Dynamic Routes
Just like Next.js, you can define dynamic routes by using brackets (`[ ]`). For example, if you have `app/[id].js`, it will map to routes like `/1`, `/2`, etc., and the `id` can be accessed inside your component.

### 3. Navigation
Expo Router is built on top of React Navigation, so you can use standard React Navigation features for navigation, such as `useNavigation`, `useRoute`, and other navigation tools.

### 4. Linking
You can use the `Link` component from `expo-router` to navigate between routes. This makes navigation feel like a natural part of the app.

```js
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <Link href="/profile">Go to Profile</Link>
  );
}
```

### 5. Custom Routes and Nested Routes
You can nest your routes by creating directories within the `app/` folder. For instance, `app/profile/index.js` will correspond to `/profile`, and you can add more nested routes under that path.

### 6. Layout Components
You can define shared layouts (like navigation headers or footers) in the `app/layout.js` file, which will wrap around your pages. This makes it easier to manage global app components.

## Example Folder Structure

```
app/
  index.js           // Home Page -> "/"
  profile/
    index.js         // Profile Page -> "/profile"
    [id].js          // Dynamic Profile Route -> "/profile/:id"
  layout.js          // Layout component for shared UI (e.g., header, footer)
```

## Benefits
- Simplified navigation setup with file-based routing.
- Easy dynamic and nested routes support.
- Built-in integration with React Navigation for advanced navigation needs.
- Shared layout management for common UI components.

Expo Router offers a streamlined navigation experience in React Native apps, leveraging React Navigation under the hood but simplifying the setup and usage with automatic file-based routing.

# Finding Your Local IPv4 Address for Expo Fetch Requests

When testing your React Native app in **Expo Go** on your mobile device, you'll need to ensure that your app can access the backend API. If you're running the backend locally (e.g., on your development machine), you need to use the **IPv4 address** of your machine, not `localhost` or `127.0.0.1`.

Follow the steps below to find the **IPv4 address** of your machine based on your operating system:

## 1. Windows

1. Press `Win + R` to open the Run dialog.
2. Type `cmd` and press Enter to open the Command Prompt.
3. Type the following command and press Enter:

ipconfig

4. Look for the **"IPv4 Address"** under the **Ethernet adapter** or **Wi-Fi adapter** section. The value will look like `192.168.x.x` (e.g., `192.168.1.100`).

Example output:

Ethernet adapter Local Area Connection: IPv4 Address. . . . . . . . . . . : 192.168.1.100


Use this IP address in your `fetch` request, replacing `localhost` or `127.0.0.1`.

## 2. macOS

1. Open **System Preferences** from the Apple menu.
2. Click on **Network**.
3. Select your active network connection (e.g., Wi-Fi).
4. Your **IPv4 address** should be displayed under the **Status** or **Advanced** section, depending on your macOS version. It will look like `192.168.x.x` (e.g., `192.168.1.100`).

Alternatively, you can use the Terminal:
1. Open **Terminal**.
2. Type the following command and press Enter:

ifconfig

3. Look for the `inet` field under the section for your active network interface (usually `en0` for Ethernet or `en1` for Wi-Fi). The IP address will look like `192.168.x.x`.

Example output:

en1: flags=8863<UP,BROADCAST,RUNNING,SMART,POINTOPOINT,MULTICAST> mtu 1500 inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255


## 3. Linux

1. Open a terminal window.
2. Type the following command and press Enter:

ifconfig

(If `ifconfig` is not available, use `ip addr` instead.)

3. Look for the **inet** field under the network interface you're using (e.g., `eth0` for Ethernet or `wlan0` for Wi-Fi). The value will look like `192.168.x.x`.

Example output:

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500 inet 192.168.1.100 netmask 255.255.255.0 broadcast 192.168.1.255


## Updating Your Fetch Request

Once you've located your **IPv4 address**, update the `fetch` URL in your app to use the IP address instead of `localhost` or `127.0.0.1`.

Example:

```js
fetch("http://192.168.1.100:5000/user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

    Note: Ensure your mobile device and the development machine are on the same local network (Wi-Fi), so the phone can access the backend running on the machine.