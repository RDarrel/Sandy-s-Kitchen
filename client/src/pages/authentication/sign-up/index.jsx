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
import useGoogleAuth from "../useGoogleAuth";
import Spinner from "@/components/shared/spinner";
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
  const { isLoading, isLoadingSigninWithGoogle } = useSelector(
      ({ auth }) => auth,
    ),
    [passWarning, setPassWarning] = useState(""),
    navigate = useNavigate(),
    dispatch = useDispatch();
  const googleLogin = useGoogleAuth();

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
        <Field className={"gap-1"}>
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
          <Field className={"gap-1"}>
            <FieldLabel htmlFor="fname">First Name</FieldLabel>
            <Input id="fname" type="text" placeholder="e.g. Juan" required />
          </Field>
          <Field className={"gap-1"}>
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
          <Field className={"gap-1"}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field className={"gap-1"}>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
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
        <Field>
          <Button
            type="submit"
            disabled={isLoading || isLoadingSigninWithGoogle}
          >
            Sign-up {isLoading && <Loader className="animate-spin" />}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>

        <Button
          variant="outline"
          type="button"
          onClick={() => googleLogin()}
          disabled={isLoadingSigninWithGoogle || isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5c-2 1.4-4.5 2.2-7.2 2.2-5.2 0-9.6-3.1-11.2-7.5l-6.5 5C9.5 39.7 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.6 5.3-6.1 6.8l6.1 5C39.9 36.5 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          Continue with Google
          <Spinner formSubmitted={isLoadingSigninWithGoogle} />
        </Button>
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
