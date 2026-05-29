import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "N4/N5 日文練習",
    short_name: "JLPT 練習",
    description: "JLPT N5 and N4 curated vocabulary practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#fffaf2",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
