import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "./errors";
import { errorResponse } from "./http";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("errorResponse", () => {
  it("serializes AppError with its status and code", async () => {
    const response = errorResponse(
      new AppError("No trobat", 404, "NOT_FOUND"),
      "ca",
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "No trobat",
      code: "NOT_FOUND",
    });
  });

  it("returns the first Zod issue", async () => {
    const result = z.string().min(5, "Massa curt").safeParse("abc");
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const response = errorResponse(result.error, "ca");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Massa curt" });
  });

  it("localizes syntax errors", async () => {
    const response = errorResponse(new SyntaxError("bad JSON"), "es");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "No se ha podido leer la petición.",
    });
  });

  it("hides unexpected errors and logs them", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = errorResponse(new Error("secret intern"), "ca");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Ha passat un error inesperat. Torna-ho a provar.",
    });
    expect(log).toHaveBeenCalled();
  });
});
