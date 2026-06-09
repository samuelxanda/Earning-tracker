import { EarningsTabBar } from "./components/EarningsTabBar";

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <EarningsTabBar />
    </div>
  );
}
