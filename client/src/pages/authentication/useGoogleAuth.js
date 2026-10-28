import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { navigateByRole } from "./navigateByRole";
import { SIGNIN_WITH_GOOGLE } from "@/services/redux/slices/persons/auth";

const useGoogleAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (response) => {
      try {
        const { payload } = await dispatch(
          SIGNIN_WITH_GOOGLE(response.code),
        ).unwrap();

        navigateByRole(navigate, payload?.user?.role);
      } catch (error) {
        toast.error(error?.error || "Google authentication failed", {
          description: error?.message,
          duration: 2000,
        });
      }
    },

    onError: () => {
      toast.error("Google login failed");
    },
  });

  return googleLogin;
};

export default useGoogleAuth;
