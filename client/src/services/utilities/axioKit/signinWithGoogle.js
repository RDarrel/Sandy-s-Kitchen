import axios from "axios";

const signinWithGoogle = async (code) => {
  try {
    const { data } = await axios.post(
      "persons/auth/google-signin",
      { code },
      { withCredentials: true },
    );

    return data;
  } catch (error) {
    const { error: title, message } = error.response?.data || {};

    throw {
      error: title || "Google Sign-In Failed",
      message: message || "Please try again later.",
    };
  }
};

export default signinWithGoogle;
