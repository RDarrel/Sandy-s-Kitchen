import Logo from "../../assets/logos/kitchenette.jpg";
import "./index.css";
import LoginForm from "./login";

const Authentication = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center text-primary-foreground rounded-full">
              <img
                src={Logo}
                alt="Image"
                className="h-10 w-10  rounded-full "
              />
            </div>
            Sandy's Kitchenette.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/489862565_122108557718817489_1360067411611265537_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHWUiuu7ijFnO84NTCda9kfMk3gox5931kyTeCjHn3fWcmaO8VbL6reiBUQ04_DSkOLymIZH285JgqQ19wHBbd4&_nc_ohc=HyLBWvs3gJIQ7kNvwFSguIE&_nc_oc=AdpvBsFPAyUleuoKwaQMoKX-raRKQhq5i6CN9Zjlq1UeUAG2vl1z3zAL70UxO53nrMc&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=8p5TY5L9qCB-Xj5bUd_lbg&_nc_ss=7a3a8&oh=00_Af3uHACAifokrd52BR5e5VgOvaHf2wqnfTELQnMm-V9PCg&oe=69E3A3DD"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Authentication;
