import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import { Preset } from "@primeuix/themes/types";
import { surfaces } from "./surfaces";

export const Amber: Preset = definePreset(Aura, {
  semantic: {
    primary: Aura.primitive?.amber,
    colorScheme: {
      dark: { surface: surfaces.soho },
      light: { surface: surfaces.soho },
    },
  },
});
