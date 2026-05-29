export type ThemeId = "rose-gold" | "navy-gold" | "sage-green" | "lavender" | "terracota";

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  preview: { bg: string; primary: string; secondary: string };
  vars: Record<string, string>;
};

export const THEMES: Theme[] = [
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Quente e sofisticado — padrão do template",
    preview: { bg: "#FDFAF7", primary: "#B8865A", secondary: "#7D3B47" },
    vars: {},
  },
  {
    id: "navy-gold",
    name: "Azul & Dourado",
    description: "Elegância naval com toques dourados",
    preview: { bg: "#F8F9FD", primary: "#3B6EA5", secondary: "#1E3A5F" },
    vars: {
      "--primary": "#3B6EA5",
      "--primary-dark": "#2C5280",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#1E3A5F",
      "--secondary-foreground": "#FFFFFF",
      "--accent": "#C8E0F4",
      "--accent-foreground": "#1A2744",
      "--background": "#F8F9FD",
      "--bg-alt": "#EEF3FA",
      "--foreground": "#1A2744",
      "--dark": "#1A2744",
      "--text-muted": "#5A7A9A",
      "--gold-light": "#C8A96A",
      "--border": "#D4E0EE",
      "--input": "#D4E0EE",
      "--ring": "#3B6EA5",
      "--muted": "#EEF3FA",
      "--muted-foreground": "#5A7A9A",
    },
  },
  {
    id: "sage-green",
    name: "Verde Sage",
    description: "Natural e acolhedor com toques terrosos",
    preview: { bg: "#F5F7F2", primary: "#6A9E7A", secondary: "#3A6A4E" },
    vars: {
      "--primary": "#6A9E7A",
      "--primary-dark": "#527A5E",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#3A6A4E",
      "--secondary-foreground": "#FFFFFF",
      "--accent": "#C8DEC8",
      "--accent-foreground": "#1E3228",
      "--background": "#F5F7F2",
      "--bg-alt": "#E8F0E8",
      "--foreground": "#1E3228",
      "--dark": "#1E3228",
      "--text-muted": "#5A7A64",
      "--gold-light": "#C8A96A",
      "--border": "#C8DACC",
      "--input": "#C8DACC",
      "--ring": "#6A9E7A",
      "--muted": "#E8F0E8",
      "--muted-foreground": "#5A7A64",
    },
  },
  {
    id: "lavender",
    name: "Lavanda & Dourado",
    description: "Delicado e premium com tons lilás",
    preview: { bg: "#F7F5FD", primary: "#9B7EC4", secondary: "#6B4A9E" },
    vars: {
      "--primary": "#9B7EC4",
      "--primary-dark": "#7A5EA8",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#6B4A9E",
      "--secondary-foreground": "#FFFFFF",
      "--accent": "#E2D8F5",
      "--accent-foreground": "#2A1E3A",
      "--background": "#F7F5FD",
      "--bg-alt": "#EDE8F8",
      "--foreground": "#2A1E3A",
      "--dark": "#2A1E3A",
      "--text-muted": "#7A6A9A",
      "--gold-light": "#C8A96A",
      "--border": "#D8D0EE",
      "--input": "#D8D0EE",
      "--ring": "#9B7EC4",
      "--muted": "#EDE8F8",
      "--muted-foreground": "#7A6A9A",
    },
  },
  {
    id: "terracota",
    name: "Terracota",
    description: "Vibrante e caloroso com tons de barro",
    preview: { bg: "#FDF8F5", primary: "#C4694A", secondary: "#8B3A27" },
    vars: {
      "--primary": "#C4694A",
      "--primary-dark": "#A34D32",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#8B3A27",
      "--secondary-foreground": "#FFFFFF",
      "--accent": "#F0D4C4",
      "--accent-foreground": "#3A1C10",
      "--background": "#FDF8F5",
      "--bg-alt": "#F5EAE2",
      "--foreground": "#3A1C10",
      "--dark": "#3A1C10",
      "--text-muted": "#8A5A48",
      "--gold-light": "#D4B896",
      "--border": "#E8D0C0",
      "--input": "#E8D0C0",
      "--ring": "#C4694A",
      "--muted": "#F5EAE2",
      "--muted-foreground": "#8A5A48",
    },
  },
];

export function getTheme(id?: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
