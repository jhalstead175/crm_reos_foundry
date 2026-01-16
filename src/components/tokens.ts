export type DensityMode = "standard" | "compact";

export const setDensity = (density: DensityMode) => {
  document.documentElement.setAttribute("data-density", density);
};

export const getDensity = (): DensityMode =>
  (document.documentElement.getAttribute("data-density") as DensityMode) ??
  "standard";
