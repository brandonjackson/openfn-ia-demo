import { describe, expect, it } from "vitest";
import { envVarKeyError, listEnvironments, parseEnvFile, takenEnvironments, type EnvVar } from "./env-vars";

const v = (id: string, key: string, environments: EnvVar["environments"]): EnvVar => ({
  id,
  key,
  value: "x",
  secret: false,
  environments,
  updatedAt: "now",
  updatedBy: "Ana",
});

describe("envVarKeyError", () => {
  it("asks for a key, then one a process can read", () => {
    expect(envVarKeyError("  ")).toBe("Enter a key");
    expect(envVarKeyError("1PASSWORD")).toMatch(/not starting with a digit/);
    expect(envVarKeyError("API-KEY")).toMatch(/underscores/);
    expect(envVarKeyError("API_KEY")).toBeUndefined();
    expect(envVarKeyError("_private2")).toBeUndefined();
  });
});

describe("takenEnvironments", () => {
  const vars = [v("a", "API_URL", ["production"]), v("b", "API_URL", ["staging", "mock"])];

  it("names the environments where the key is already set", () => {
    expect(takenEnvironments(vars, "API_URL", ["production", "staging"])).toEqual(["production", "staging"]);
    expect(takenEnvironments(vars, "API_URL", ["mock"], "b")).toEqual([]);
    expect(takenEnvironments(vars, "api_url", ["production"])).toEqual([]);
  });
});

describe("parseEnvFile", () => {
  it("reads key=value lines, skipping comments and blanks, dropping export and quotes", () => {
    const text = `# DHIS2\nexport DHIS2_URL="https://play.dhis2.org"\n\nLOG_LEVEL=info\nGREETING='hello = world'\nnot a pair\n=orphan`;
    expect(parseEnvFile(text)).toEqual([
      { key: "DHIS2_URL", value: "https://play.dhis2.org" },
      { key: "LOG_LEVEL", value: "info" },
      { key: "GREETING", value: "hello = world" },
    ]);
  });
});

describe("listEnvironments", () => {
  it("names them in order, as a sentence", () => {
    expect(listEnvironments(["mock", "production"])).toBe("production and mock");
    expect(listEnvironments(["staging", "mock", "production"])).toBe("production, staging and mock");
    expect(listEnvironments(["staging"])).toBe("staging");
  });
});
