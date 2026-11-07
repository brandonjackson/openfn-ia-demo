import { describe, expect, it } from "vitest";
import { instanceInitials, instanceName } from "./account";

describe("instanceName", () => {
  it("uses the instance's own name when it has one", () => {
    expect(instanceName("Sim DTU", "https://sim.example.org")).toBe("Sim DTU");
  });

  it("goes by the URL's host when there's no name, as on Lightning", () => {
    expect(instanceName(undefined, "https://demo.openfn.org")).toBe("demo.openfn.org");
    expect(instanceName("", "http://localhost:4000")).toBe("localhost");
  });
});

describe("instanceInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(instanceInitials("Sim DTU")).toBe("SD");
    expect(instanceInitials("Ministry of Health")).toBe("MO");
  });

  it("takes the first two letters of one word, or of a host's first part", () => {
    expect(instanceInitials("demo.openfn.org")).toBe("DE");
    expect(instanceInitials("localhost")).toBe("LO");
  });
});
