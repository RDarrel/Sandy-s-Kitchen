import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOGIN, RESET } from "@/services/redux/slices/persons/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // pwede icon library
import { Loader } from "lucide-react";
import logo from "../../assets/logo.png";
import homePage from "./homePage.svg";
import "./index.css";

const Home = () => {
  const {
      isSuccess,
      isLoading,
      auth,
      message = "",
    } = useSelector(({ auth }) => auth),
    dispatch = useDispatch(),
    navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (auth?._id && isSuccess && !isLoading) {
      const isCashier = auth?.role?.name === "CASHIER";
      navigate(isCashier ? "/cashier" : "/platforms/dashboard");
      dispatch(RESET());
    }
  }, [auth, isSuccess, dispatch, isLoading]);

  useEffect(() => {
    if (message) {
      toast[isSuccess ? "success" : "error"](message, {
        duration: 1000, // 1 second lang bago mawala
      });
      dispatch(RESET());
    }
  }, [message, dispatch]);
  const handleSubmit = (e) => {
    e.preventDefault();

    const { email, password } = e.target;

    dispatch(
      LOGIN({
        email: email.value,
        password: password.value,
      })
    );
  };
  return (
    <div className="grid grid-cols-2 h-[100vh] ">
      <div className="bg-[#FF4F00] left-column p-4 flex flex-col h-screen">
        <div>
          <img src={logo} className="h-[60px]" alt="Logo" />
        </div>

        <h2 className="font-[650] text-[40px] ml-4 my-5 text-white">
          <span>Manage Your Gas Station</span>
          <br />
          <span className="-mt-[1.3rem] block">Business So Advanced</span>
        </h2>

        <div className="flex-1 mt-2 relative min-h-0">
          <img
            src={homePage}
            className="w-full h-full object-contain"
            alt="Home"
          />
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#FFF0D6]">
        <Card className="h-[450px] w-[500px] border border-white border-[4px] bg-[#F5F2ED]">
          <CardContent>
            <h2 className="text-[20px] font-bold">Sign in to your account</h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5 items-center justify-center h-80">
                <div className="grid w-full max-w-xs items-center gap-1.5">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    className="bg-white"
                    required
                  />
                </div>
                <div className="relative w-full max-w-xs">
                  <label htmlFor="password" className="text-gray-700">
                    Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    className="bg-white pr-10 h-10" // siguruhing consistent ang height
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 h-6 flex items-center justify-center mt-3"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Button
                  className="w-80 bg-[#FF4F00] hover:bg-[#cc3f00] text-white cursor-pointer"
                  type="submit"
                  disabled={isLoading}
                >
                  Sign in
                  {isLoading && <Loader className="animate-spin" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
