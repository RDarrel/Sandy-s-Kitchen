import { Route } from "react-router-dom";
import ACCESS from "./platforms/access";
import { ADMIN_SYSTEM } from "./platforms/admininistrator/access";

const RouteConfig = (auth) => {
  const handleRoutes = () => {
    const routes =
      auth?.role === 1
        ? [...ADMIN_SYSTEM, ...(ACCESS[auth?.role] || [])]
        : ACCESS[auth?.role] || [];

    const renderRoutes = (routes, parentPath = "/platforms") => {
      return routes.flatMap(({ path = "", component: Component, children }) => {
        const fullPath = `${parentPath}/${path}`.replace(/\/+/g, "/");

        const currentRoute = Component
          ? [<Route key={fullPath} path={fullPath} element={<Component />} />]
          : [];

        const nestedRoutes = children?.length
          ? renderRoutes(children, fullPath)
          : [];

        return [...currentRoute, ...nestedRoutes];
      });
    };

    return renderRoutes(routes);
  };

  return handleRoutes();
};

export default RouteConfig;
