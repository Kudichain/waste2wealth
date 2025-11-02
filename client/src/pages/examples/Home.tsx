import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "../Home";

export default function HomeExample() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}
