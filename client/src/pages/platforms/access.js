import { ADMIN_MANAGEMENT } from "./admininistrator/access";
import STOCKMAN from "./stockman/access";
import CUSTOMER from "./customer/access";
const access = {
  1: ADMIN_MANAGEMENT,
  4: STOCKMAN,
  6: CUSTOMER,
};

export default access;
