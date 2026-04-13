import axios from "axios";

/**
 * Upload function.
 *
 * @param {Array<any>|object} data - Information that contains the file data.
 * @param {string} token - Authorization Token.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const upload = async (data, token, onUploadProgress) =>
  await axios
    .post("auth/upload", data, {
      headers: {
        Authorization: `QTracy ${token}`,
      },
      onUploadProgress,
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default upload;
