import { definePreset } from "@primeng/themes";
import Aura from "@primeng/themes/aura";
import { AuraBaseDesignTokens } from "@primeng/themes/aura/base";
import { Preset } from "@primeng/themes/types";

const surfaces = {
  slate: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  gray: {
    0: "#ffffff",
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  zinc: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
  stone: {
    0: "#ffffff",
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09",
  },
  soho: {
    0: "#ffffff",
    50: "#ececec",
    100: "#dedfdf",
    200: "#c4c4c6",
    300: "#adaeb0",
    400: "#97979b",
    500: "#7f8084",
    600: "#6a6b70",
    700: "#55565b",
    800: "#3f4046",
    900: "#2c2c34",
    950: "#16161d",
  },
  viva: {
    0: "#ffffff",
    50: "#f3f3f3",
    100: "#e7e7e8",
    200: "#cfd0d0",
    300: "#b7b8b9",
    400: "#9fa1a1",
    500: "#87898a",
    600: "#6e7173",
    700: "#565a5b",
    800: "#3e4244",
    900: "#262b2c",
    950: "#0e1315",
  },
  ocean: {
    0: "#ffffff",
    50: "#fbfcfc",
    100: "#F7F9F8",
    200: "#EFF3F2",
    300: "#DADEDD",
    400: "#B1B7B6",
    500: "#828787",
    600: "#5F7274",
    700: "#415B61",
    800: "#29444E",
    900: "#183240",
    950: "#0c1920",
  },
};

export const aura: Preset<AuraBaseDesignTokens> = definePreset(Aura, {
  semantic: {
    primary: Aura.primitive?.amber,
    colorScheme: {
      dark: {
        // Aura.semantic?.colorScheme?.dark?.surface
        surface: surfaces.soho,
      },
      light: {
        surface: surfaces.soho,
      },
    },
  },
});
