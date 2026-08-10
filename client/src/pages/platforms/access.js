import ADMINISTRATOR from "./admininistrator/access";
import STOCKMAN from "./stockman/access";
import CUSTOMER from "./customer/access";
const access = {
  1: ADMINISTRATOR,
  4: STOCKMAN,
  6: CUSTOMER,
};

export default access;
