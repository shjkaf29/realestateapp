import { Layout, RequireAuth } from "./routes/layout/layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";

import AboutPage from "./routes/aboutPage/aboutPage";
import HomePage from "./routes/homePage/homePage";
import ListPage from "./routes/listPage/listPage";
import Login from "./routes/login/login";
import NewPostPage from "./routes/newPostPage/newPostPage";
import ProfilePage from "./routes/profilePage/profilePage";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import Register from "./routes/register/register";
import SinglePage from "./routes/singlePage/singlePage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/about",
          element: <AboutPage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },

        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
