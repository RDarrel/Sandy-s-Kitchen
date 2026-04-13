const Entity = require("../../models/persons/Users"),
  generateToken = require("../../config/generateToken"),
  bcrypt = require("bcryptjs"),
  fs = require("fs");

exports.login = (req, res) => {
  const { email, password } = req.query;

  Entity.findOne({ email })
    .select("-createdAt -updatedAt -__v")
    .populate({ path: "role", select: "name power" })
    .then(async (item) => {
      if (!item)
        return res.status(404).json({
          error: "User Not Found",
          message: "The provided Credentials does not exist.",
        });

      if (item.wasBanned)
        return res.status(400).json({
          error: "Banned",
          message:
            "You are banned from our website. Please contact the principal or registrar of the school.",
        });

      // if (!item.wasApproved)
      //   return res.status(400).json({
      //     error: "Not Approved",
      //     message: "Waiting for your approval kindly always check your email",
      //   });

      if (!(await item.matchPassword(password)))
        return res.status(400).json({
          error: "Invalid Credentials",
          message: "The provided Credentials does not match.",
        });

      const user = { ...item._doc };
      delete user.password;

      res.json({
        success: "Login Success",
        payload: {
          token: generateToken({ _id: item?._id, role: item.role }),
          user,
        },
      });
    })
    .catch((error) => res.status(400).json({ error: error.message }));
};

exports.provideAuth = async (_, res) => {
  const user = res.locals.caller;
  res.json({
    success: "Validatation Success",
    payload: { user },
  });
};

exports.upload = (req, res) => {
  const { path, base64, name } = req.body;
  const url = `./assets/${path}`;
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url, { recursive: true });
  }
  try {
    fs.writeFileSync(`${url}/${name}`, base64, "base64");
    return res.json({ message: "File Uploaded Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// exports.changePassword = async (req, res) => {
//   const { newPassword, _id } = DECRYPT(req.body.data);
//   const salt = await bcrypt.genSalt(10);
//   const hashNewPassword = await bcrypt.hash(newPassword, salt);

//   Entity.findByIdAndUpdate(_id, { password: hashNewPassword }, { new: true })
//     .then((item) => {
//       if (item) {
//         res.json({
//           success: "Password Change Successfully",
//           payload: ENCRYPT(item),
//         });
//       } else {
//         res.status(404).json({
//           error: "ID Not Found",
//           message: "The provided ID does not exist.",
//         });
//       }
//     })
//     .catch((error) => res.status(400).json({ error: handleDuplicate(error) }));
// };
