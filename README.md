# Recipe Selector
This app provides a dropdown menu that fetches and displays a list of recipes, along with their details, using a service worker for caching and offline support.

## Features:
- Fetches recipe names and displays them in a dropdown menu.
- Fetches detailed information about a selected recipe (ingredients, instructions, difficulty).
- Uses a service worker to cache API responses.
- Implements proper caching mechanisms with cache control.
- Includes error handling for edge cases like service worker not being available.

## How It Works
### Recipe Dropdown Component (src/components/RecipeDropdown.js):
1. Fetching Recipe List:
- When the component mounts, it checks if a service worker is registered and available. Once the service worker is ready (i.e., it is activated and controls the page), a message is sent to the service worker to fetch the list of recipes.
- The service worker intercepts this request, checks the cache first, and if data is not available in the cache, it fetches the recipe list from the network and caches it for future requests.
2. Selecting a Recipe:
- When the user selects a recipe from the dropdown menu, the component sends another message to the service worker, requesting the detailed information for the selected recipe.
- The service worker responds with cached recipe details if available, or fetches it from the network, caches the result, and sends the data back to the component for display.
3. Error Handling:
- If there is any issue with fetching recipes (e.g., no service worker, failed network requests), appropriate error messages are displayed.

### Service Worker (public/service-worker.js):
- The service worker listens for fetch events, intercepts API requests to the recipes API, and checks the cache first. If the requested data is cached, it serves the cached response. If not, it fetches the data from the network, caches it, and then serves the response.
- The service worker also listens for messages from the RecipeDropdown component, such as when requesting the recipe list or specific recipe details.

## Installation and Setup Instructions
1. Install Node.js
Ensure that you have Node.js and npm installed on your machine. You can verify by running:
```
node -v
npm -v
```
If you don't have Node.js installed, download and install it from the official site: https://nodejs.org.

2. Clone the Repository
Once you have Node.js installed, follow these steps to set up the project:
```
git clone https://github.com/kanwalgs/recipe-selector-task.git
cd your-project-directory
```
3. Install Dependencies
Run the following command to install the required dependencies:
```
npm install
```
4. Run the Application
To run the app in development mode:
```
npm start
```
This command will start the app, and it will be available at http://localhost:3000. Open this URL in your browser to view the app.

5. Build the Application (Optional)
To build the app for production:
```
npm run build
```
This will create a build folder containing the optimized production-ready files.

## Service Worker Registration
The service worker is automatically registered in the React app when the app is built for production. It caches responses using the Cache API and serves cached responses for future requests or when the network is unavailable.

## Common Issues and Debugging
1. Service Worker Not Registering:
- Make sure you're running the project on localhost or via HTTPS (in production).
- Check the browser's DevTools > Console for any errors.
2. Cache Issues:
- Clear the browser cache manually if stale data is being served. Go to DevTools > Application > Clear site data.
3. Recipes Not Displaying in Incognito Mode:
- Ensure the service worker is fully activated before trying to fetch the recipes. The navigator.serviceWorker.ready promise ensures the service worker is active. 
- A quick reload should fix the issue.
