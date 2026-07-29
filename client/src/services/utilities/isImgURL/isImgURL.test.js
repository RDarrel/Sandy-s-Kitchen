import { describe, it, expect } from "vitest";
import isImgURL from "./index";

describe("isImageUrl", () => {
  it("returns true for a valid Cloudinary URL", () => {
    expect(
      isImgURL("https://res.cloudinary.com/demo/image/upload/sample"),
    ).toBe(true);
  });
});
