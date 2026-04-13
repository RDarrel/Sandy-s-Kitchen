import axios from "axios";

/**
 * Login function.
 *
 * @param {string} email - E-mail Address used for authentication.
 * @param {string} password - Password used for authentication.
 * @returns {{ success: boolean, payload: object }} - The result object containing success and payload.
 */
const signinWithGoogle = async (email, googleID) =>
  await axios
    .get(`auth/googleLogin?email=${email}&googleID=${googleID}`)
    .then(({ data }) => {
      const { payload } = data;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("email", payload.user.email);
      return data;
    })
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default signinWithGoogle;
