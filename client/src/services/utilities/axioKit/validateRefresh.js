import axios from "axios";

/**
 * Validation of token on refresh.
 *
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const validateRefresh = async () =>
  await axios
    .get(`persons/auth/validateRefresh`, {
      withCredentials: true,
      timeout: 15000,
    })
    .then(({ data }) => data)
    .catch((error) => {
      const { status, data } = error.response ?? {};

      if (status === 401 || status === 403) {
        return { payload: {}, requiresSignIn: true };
      }

      const message = data?.message || data?.error || error.message;
      throw new Error(message || "Unable to verify your session.");
    });

export default validateRefresh;
