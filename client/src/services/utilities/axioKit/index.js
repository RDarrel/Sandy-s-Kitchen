import login from "./login";
import validateRefresh from "./validateRefresh";
import destroy from "./destroy";
import update from "./update";
import save from "./save";
import universal from "./universal";
import changePassword from "./changePassword";
import upload from "./upload";
import docuUpload from "./docuUpload";
import signinWithGoogle from "./signinWithGoogle";

const axioKit = {
  upload,
  login,
  validateRefresh,
  destroy,
  update,
  save,
  universal,
  changePassword,
  docuUpload,
  signinWithGoogle,
};

export default axioKit;
