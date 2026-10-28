import axios from "axios";

/**
 * Login function.
 *
 * @param {string} email - E-mail Address used for authentication.
 * @param {string} password - Password used for authentication.
 * @returns {{ success: boolean, payload: object }} - The result object containing success and payload.
 */
const login = async (email, password) =>
  await axios
    .get(`persons/auth/login?email=${email}&password=${password}`, {
      withCredentials: true,
    })
    .then(({ data }) => {
      const { payload } = data;
      localStorage.setItem("email", payload.user.email);
      return data;
    })
    .catch((err) => {
      const { error: title, message } = err.response?.data || {};
      throw {
        error: title || "Google Sign-In Failed",
        message: message || "Please try again later.",
      };
    });

export default login;
