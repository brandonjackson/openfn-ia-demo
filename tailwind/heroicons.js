// Embeds Heroicons as `hero-*` utility classes, exactly as Lightning does
// (assets/tailwind.config.ts in OpenFn/lightning), so markup copied from
// Lightning works unchanged: <span className="hero-folder h-5 w-5" />.
//
//   hero-<name>        24px outline
//   hero-<name>-solid  24px solid
//   hero-<name>-mini   20px solid
//   hero-<name>-micro  16px solid
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import plugin from "tailwindcss/plugin";

const require = createRequire(import.meta.url);
const iconsDir = path.dirname(require.resolve("heroicons/package.json"));

export default plugin(function ({ matchComponents, theme }) {
  const values = {};
  const sets = [
    ["", "24/outline"],
    ["-solid", "24/solid"],
    ["-mini", "20/solid"],
    ["-micro", "16/solid"],
  ];
  for (const [suffix, dir] of sets) {
    for (const file of fs.readdirSync(path.join(iconsDir, dir))) {
      const name = path.basename(file, ".svg") + suffix;
      values[name] = { name, fullPath: path.join(iconsDir, dir, file) };
    }
  }
  matchComponents(
    {
      hero: ({ name, fullPath }) => {
        const content = fs
          .readFileSync(fullPath)
          .toString()
          .replace(/\r?\n|\r/g, "");
        let size = theme("spacing.6");
        if (name.endsWith("-mini")) size = theme("spacing.5");
        else if (name.endsWith("-micro")) size = theme("spacing.4");
        return {
          [`--hero-${name}`]: `url('data:image/svg+xml;utf8,${content}')`,
          "-webkit-mask": `var(--hero-${name})`,
          mask: `var(--hero-${name})`,
          "mask-repeat": "no-repeat",
          "background-color": "currentColor",
          "vertical-align": "middle",
          display: "inline-block",
          width: size,
          height: size,
        };
      },
    },
    { values }
  );
});
