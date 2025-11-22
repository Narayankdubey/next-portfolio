"use client";

import { createContext, useContext, ReactNode } from "react";
import { IPortfolio } from "@/models/Portfolio";

interface PortfolioContextType {
  portfolio: IPortfolio | null;
}

const PortfolioContext = createContext<PortfolioContextType>({ portfolio: null });

export function PortfolioProvider({
  children,
  portfolio,
}: {
  children: ReactNode;
  portfolio: IPortfolio | null;
}) {
  return <PortfolioContext.Provider value={{ portfolio }}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  return useContext(PortfolioContext).portfolio;
}
