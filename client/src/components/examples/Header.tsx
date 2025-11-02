import { Header } from "../Header";
import { ThemeProvider } from "../ThemeProvider";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header balance={2450} showWallet={true} />
    </ThemeProvider>
  );
}
