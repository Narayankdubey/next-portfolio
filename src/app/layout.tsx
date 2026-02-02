import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { MinimizedWindowsProvider } from "@/context/MinimizedWindowsContext";
import { SoundProvider } from "@/context/SoundContext";
import { FeatureFlagsProvider } from "@/context/FeatureFlagsContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import FeatureFlags from "@/models/FeatureFlags";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Narayan Dubey | Full Stack Developer",
  description:
    "Portfolio of Narayan Dubey, a Full Stack Developer specializing in React, Node.js, and Cloud Technologies.",
};

async function getPortfolioData() {
  try {
    await dbConnect();
    const portfolio = await Portfolio.findOne().lean();
    return portfolio ? JSON.parse(JSON.stringify(portfolio)) : null;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return null;
  }
}

async function getFeatureFlagsData() {
  try {
    await dbConnect();
    const flags = await FeatureFlags.findOne().lean();
    return flags ? JSON.parse(JSON.stringify(flags)) : null;
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portfolioData = await getPortfolioData();
  const featureFlagsData = await getFeatureFlagsData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <FeatureFlagsProvider initialFlags={featureFlagsData}>
          <ThemeProvider>
            <SoundProvider>
              <ToastProvider>
                <MinimizedWindowsProvider>
                  <PortfolioProvider portfolio={portfolioData}>
                    <AnalyticsProvider>{children}</AnalyticsProvider>
                  </PortfolioProvider>
                </MinimizedWindowsProvider>
              </ToastProvider>
            </SoundProvider>
          </ThemeProvider>
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}
