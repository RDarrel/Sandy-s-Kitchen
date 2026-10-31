import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import validateRefresh from "../../../utilities/axioKit/validateRefresh";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("../../../utilities", async () => ({
  ENDPOINT: "",
  axioKit: {
    validateRefresh: (await import("../../../utilities/axioKit/validateRefresh")).default,
  },
}));

import reducer, { VALIDATEREFRESH } from "./auth";

beforeEach(() => vi.clearAllMocks());

describe("startup session check", () => {
  it.each([401, 403])("finishes as a guest on HTTP %s without redirecting", async (status) => {
    axios.get.mockRejectedValue({ response: { status } });
    const store = configureStore({ reducer });
    await store.dispatch(VALIDATEREFRESH());
    expect(store.getState().isCheckingAuth).toBe(false);
    expect(store.getState().auth).toEqual({});
  });

  it.each(["Network Error", "timeout of 15000ms exceeded"])(
    "clears loading when the request fails: %s",
    async (message) => {
      axios.get.mockRejectedValue(new Error(message));
      const store = configureStore({ reducer });
      const result = await store.dispatch(VALIDATEREFRESH());
      expect(result.type).toBe(VALIDATEREFRESH.rejected.type);
      expect(store.getState().isCheckingAuth).toBe(false);
      expect(store.getState().message).toBe(message);
      expect(axios.get).toHaveBeenCalledWith(
        "persons/auth/validateRefresh",
        expect.objectContaining({ timeout: 15000, withCredentials: true }),
      );
    },
  );

  it("keeps loading until the request settles, then stores the user", async () => {
    let complete;
    axios.get.mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    const store = configureStore({ reducer });
    const request = store.dispatch(VALIDATEREFRESH());
    expect(store.getState().isCheckingAuth).toBe(true);
    const user = { _id: "customer", role: 6 };
    complete({ data: { payload: { user } } });
    await request;
    expect(store.getState().isCheckingAuth).toBe(false);
    expect(store.getState().auth).toEqual(user);
  });

  it("handles an empty successful response without leaving the loader active", () => {
    const state = reducer(undefined, VALIDATEREFRESH.fulfilled(undefined, "request"));
    expect(state.isCheckingAuth).toBe(false);
    expect(state.auth).toEqual({});
  });

  it("preserves a server error message", async () => {
    axios.get.mockRejectedValue({ response: { status: 500, data: { message: "Service unavailable" } } });
    await expect(validateRefresh()).rejects.toThrow("Service unavailable");
  });

  it("marks a 401 response for sign-in navigation", async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(validateRefresh()).resolves.toEqual({
      payload: {}, requiresSignIn: true,
    });
  });
});
