export const navigateByRole = (navigate, role) => {
  if (role === 2) {
    navigate("/cashier");
  } else if (role === 5) {
    navigate("/coordinator");
  } else if (role === 6) {
    navigate("/platforms/catering");
  } else {
    navigate("/platforms/dashboard");
  }
};
