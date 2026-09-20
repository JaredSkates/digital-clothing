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

## Project Structure

- **app/**: Screens and routes. Keep them thin.
- **components/**: Reusable UI components.
- **constants/**: Static values (theme, gradients).
- **hooks/**: React hooks that call services and manage state.
- **services/**: API and database calls.
- **types/**: TypeScript types and interfaces.
- **utils/**: Pure helper functions (formatting, conversions).

**Rule:** screens use hooks, hooks call services, services fetch data.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.
