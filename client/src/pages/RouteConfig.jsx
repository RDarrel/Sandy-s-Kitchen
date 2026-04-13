import { useSelector } from "react-redux";
import { Route } from "react-router-dom";

import ACCESS from "./platforms/access";

const RouteConfig = () => {
  const { role = "PRINCIPAL" } = useSelector(({ auth }) => auth);

  const handleRoutes = () => {
    const routes = ACCESS[role || "ADMINISTRATOR"] || [];
    return routes.map(({ path, component, children }, x) => {
      const handleRoute = (key, path, Component) => (
        <Route key={key} path={path} element={<Component />} />
      );

      if (children) {
        return children.map((child, y) =>
          handleRoute(
            `route-${x}-${y}`,
            `/platforms/${path}${child.path}`,
            child.component
          )
        );
      }

      return handleRoute(`route-${x}`, `/platforms${path}`, component);
    });
  };
  return handleRoutes();
};

export default RouteConfig;
