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

