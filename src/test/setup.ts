import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only cleans up by itself with globals on; these tests import from vitest.
afterEach(() => cleanup());
