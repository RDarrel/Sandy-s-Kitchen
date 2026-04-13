import axios from "axios";
import { ENCRYPT } from "../encryption/securedData";
/**
 * Save function.
 *
 * @param {string} entity - Base route of the API.
 * @param {object} data - Information that will be stored in the database.
 * @param {string} token - Authorization Token.
 * @returns {{ success: boolean, payload: object }} - The result object containing success and payload.
 */
const changePassword = async (entity, data, token) =>
  await axios
    .post(
      `${entity}/changePassword`,
      { data: ENCRYPT(data) },
      {
        headers: {
          Authorization: `QTracy ${token}`,
        },
      }
    )
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default changePassword;
