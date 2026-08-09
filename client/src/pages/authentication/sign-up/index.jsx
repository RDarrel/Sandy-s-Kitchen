import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/passwordInput";
import { useDispatch, useSelector } from "react-redux";
// import { REGISTER } from "@/redux/slices/auth";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SIGN_UP } from "@/services/redux/slices/persons/auth";
const getPassError = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Passwords do not match.";
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return "Password must contain at least one special character.";
  return "";
};
export default function Signup() {
  const { isLoading } = useSelector(({ auth }) => auth),
    [passWarning, setPassWarning] = useState(""),
    navigate = useNavigate(),
    dispatch = useDispatch();

  const handleSignUp = (e) => {
    e.preventDefault();
    const { email, password, lname, fname, confirmPassword } = e.target;

    //password validation
    if (getPassError(password.value, confirmPassword.value))
      return setPassWarning(
        getPassError(password.value, confirmPassword.value),
      );

    const data = {
      email: email.value,
      password: password.value,
      fullName: {
        fname: fname.value,
        lname: lname.value,
      },
    };

    dispatch(SIGN_UP(data))
      .unwrap()
      .then(() => {
        toast.success("Account created successfully", {
          duration: 2000,
        });
        navigate("/authentication/sign-in");
        //Reset the form
        e.target.reset();
      })
      .catch((error) => {
        toast.error(error?.message, {
          duration: 2000,
        });
      });
  };
  return (
    <form onSubmit={handleSignUp} className="w-full max-w-md">
      <FieldGroup className="flex flex-col gap-6 ">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign up for an account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email:</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <div className="flex gap-4">
          <Field>
            <FieldLabel htmlFor="fname">First Name</FieldLabel>
            <Input id="fname" type="text" placeholder="e.g. Juan" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="lname">Last Name</FieldLabel>
            <Input
              id="lname"
              type="text"
              placeholder="e.g. Dela Cruz"
              required
            />
          </Field>
        </div>
        <div className="flex gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </Field>
        </div>
        <FieldDescription className="font-semibold text-destructive -mt-4 mb-4 ">
          {passWarning}
        </FieldDescription>
        <small className="text-xs text-muted-foreground -mt-5">
          A strong password must contain lowercase and UPPERCASE letters,
          numbers and character symbols.
        </small>
        <FieldSeparator />
        <Field>
          <Button type="submit" disabled={isLoading}>
            Sign-up {isLoading && <Loader className="animate-spin" />}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              to="/authentication/sign-in"
              className="underline underline-offset-4"
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
