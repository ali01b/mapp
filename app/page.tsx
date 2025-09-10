"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Share2,
  MoreVertical,
  Info,
  Copy,
  BellRing,
  Clock,
  BarChart2,
  Download,
  PieChart,
  Wallet,
  Search,
  Bell,
  Eye,
  Filter,
  SortDesc,
  TrendingUp,
  Activity,
  Home,
  Briefcase,
  List,
  Lightbulb,
} from "lucide-react";

// TypeScript interfaces (keeping all original interfaces)
interface StockData {
  code: string;
  name: string;
  logo_url: string;
  last_price: number;
  daily_change: number;
  daily_change_percent: number;
  shares: number;
  entryPrice: number;
  daily_low: number;
  daily_high: number;
  weekly_low: number;
  weekly_high: number;
  monthly_low: number;
  monthly_high: number;
  yearly_low: number;
  yearly_high: number;
}

interface BistData {
  value: number;
  change: number;
  changePercent: number;
}

interface PortfolioTotals {
  totalInvestment: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  actualInvestment: number;
}

interface TransactionParams {
  symbols: string[];
  shares: number[];
  entryPrices: number[];
  type: string;
  theme: string;
}

// Utility functions (keeping original functions)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

const mockBistData: BistData = {
  value: 9742.53,
  change: 37.82,
  changePercent: 0.39,
};

const PortfolioView: React.FC = () => {
  // All original state management
  const [transactionParams, setTransactionParams] = useState<TransactionParams>(
    {
      symbols: ["TUPRS", "AKBNK", "THYAO"],
      shares: [100, 200, 50],
      entryPrices: [80.0, 48.0, 185.0],
      type: "altay",
      theme: "dark",
    }
  );

  const [portfolioData, setPortfolioData] = useState<StockData[]>([]);
  const [bistData, setBistData] = useState<BistData>(mockBistData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [animatedTotalValue, setAnimatedTotalValue] = useState<number>(0);
  const [animatedTotalPercent, setAnimatedTotalPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'summary'>('portfolio');

  const leverageRatio: number = 20;

  // All original calculation and API functions
  const calculatePortfolioTotals = (): PortfolioTotals => {
    if (portfolioData.length === 0) {
      return {
        totalInvestment: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        actualInvestment: 0,
      };
    }

    let totalInvestment = 0;
    let totalCurrentValue = 0;

    portfolioData.forEach((stock) => {
      const stockInvestment = stock.entryPrice * stock.shares;
      const stockCurrentValue = stock.last_price * stock.shares;

      totalInvestment += stockInvestment;
      totalCurrentValue += stockCurrentValue;
    });

    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercent =
      totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent,
      actualInvestment: totalInvestment / leverageRatio,
    };
  };

  const fetchPortfolioData = async (
    symbols: string[],
    shares: number[],
    entryPrices: number[]
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const promises = symbols.map(async (symbol, index) => {
        const apiUrl = `http://192.168.8.8:5000/api/sorgu/bist/${symbol}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(
            `${symbol} için API yanıt hatası: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(`${symbol} için geçerli veri alınamadı`);
        }

        const stockData: StockData = {
          code: result.data.code || symbol,
          name: result.data.name || symbol,
          logo_url:
            result.data.logo_url ||
            `https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=${symbol.charAt(
              0
            )}`,
          last_price: Number(result.data.last_price) || 0,
          daily_change: Number(result.data.daily_change) || 0,
          daily_change_percent: Number(result.data.daily_change_percent) || 0,
          shares: shares[index],
          entryPrice: entryPrices[index],
          daily_low: Number(result.data.daily_low) || 0,
          daily_high: Number(result.data.daily_high) || 0,
          weekly_low: Number(result.data.weekly_low) || 0,
          weekly_high: Number(result.data.weekly_high) || 0,
          monthly_low: Number(result.data.monthly_low) || 0,
          monthly_high: Number(result.data.monthly_high) || 0,
          yearly_low: Number(result.data.yearly_low) || 0,
          yearly_high: Number(result.data.yearly_high) || 0,
        };

        return stockData;
      });

      const stocksData = await Promise.all(promises);
      const sortedStocks = stocksData.sort((a, b) => {
        const aValue = a.last_price * a.shares;
        const bValue = b.last_price * b.shares;
        return bValue - aValue;
      });

      setPortfolioData(sortedStocks);

      const date = new Date().toLocaleDateString("tr-TR").replace(/\./g, "");
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      setTransactionId(`PF${date}${random}`);
    } catch (err: any) {
      console.error("Portföy verisi çekme hatası:", err);
      setError(err.message || "Portföy verileri çekilirken bir hata oluştu");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const portfolioTotals = calculatePortfolioTotals();

  // All original useEffect hooks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbolsParam = urlParams.get("symbols");
    const sharesParam = urlParams.get("shares");
    const pricesParam = urlParams.get("prices");
    const typeParam = urlParams.get("type") || "altay";
    const themeParam = urlParams.get("theme") || "dark";

    if (symbolsParam && sharesParam && pricesParam) {
      try {
        const symbols = symbolsParam
          .split(",")
          .map((s) => s.trim().toUpperCase());
        const shares = sharesParam.split(",").map((s) => Number(s.trim()));
        const entryPrices = pricesParam.split(",").map((s) => Number(s.trim()));

        if (
          symbols.length !== shares.length ||
          symbols.length !== entryPrices.length
        ) {
          throw new Error(
            "Parametre sayıları eşleşmiyor. Hisse, lot ve fiyat sayıları aynı olmalı."
          );
        }

        if (shares.some((s) => isNaN(s) || s <= 0)) {
          throw new Error("Lot miktarları geçerli pozitif sayılar olmalı.");
        }

        if (entryPrices.some((p) => isNaN(p) || p <= 0)) {
          throw new Error("Giriş fiyatları geçerli pozitif sayılar olmalı.");
        }

        setTransactionParams({
          symbols,
          shares,
          entryPrices,
          type: typeParam,
          theme: themeParam,
        });

        fetchPortfolioData(symbols, shares, entryPrices);
      } catch (err: any) {
        console.error("URL parametresi hatası:", err);
        setError(err.message || "URL parametreleri geçersiz");
        setIsLoading(false);
      }
    } else {
      setError(
        "Portföy parametreleri bulunamadı. URL'de symbols, shares ve prices parametrelerini kontrol edin."
      );
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const duration = 1500;
    const frames = 60;
    const interval = duration / frames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / frames;
      const easedProgress = easeOutQuart(progress);

      setAnimatedTotalValue(portfolioTotals.totalProfitLoss * easedProgress);
      setAnimatedTotalPercent(
        portfolioTotals.totalProfitLossPercent * easedProgress
      );

      if (currentFrame >= frames) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [portfolioData]);

  const isPortfolioProfit = portfolioTotals.totalProfitLoss >= 0;

  // Get stock logo URL based on stock code
  const getStockLogo = (code: string, logoUrl: string) => {
    if (logoUrl && logoUrl !== '' && logoUrl !== 'https://via.placeholder.com/52x52/64748b/FFFFFF?text=') {
      return logoUrl;
    }
    
    // Fallback to placeholder with stock code
    return `https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=${code.charAt(0)}`;
  };

  // Get shortened stock name
  const getShortStockName = (name: string) => {
    if (name.length <= 15) return name;
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 12) + '...';
    }
    
    return words[0] + ' ' + words[1] + (words.length > 2 ? '...' : '');
  };

  // Get risk level for stock
  const getRiskLevel = (changePercent: number) => {
    if (Math.abs(changePercent) < 2) return "risk-low";
    if (Math.abs(changePercent) < 5) return "risk-medium";
    return "risk-high";
  };

  // Build semi-circle segment dash arrays for portfolio distribution
  const getPortfolioSegments = () => {
    if (!portfolioData || portfolioData.length === 0) return [] as Array<{ color: string; dasharray: string; dashoffset: number }>;

    const palette = ["#1E3A8A", "#3B82F6", "#8B5CF6", "#10B981", "#6B7280"]; // others -> gray
    const pathLength = 330; // approximate length used in previous arcs

    const entries = portfolioData
      .map((s) => ({ code: s.code, value: s.last_price * s.shares }))
      .sort((a, b) => b.value - a.value);

    const total = entries.reduce((acc, e) => acc + e.value, 0);
    if (total <= 0) return [] as Array<{ color: string; dasharray: string; dashoffset: number }>;

    // top 4 + other
    const top = entries.slice(0, 4);
    const otherValue = entries.slice(4).reduce((acc, e) => acc + e.value, 0);
    const parts = otherValue > 0 ? [...top, { code: "Diger", value: otherValue }] : top;

    let start = 0;
    return parts.map((p, idx) => {
      const percent = p.value / total; // 0..1
      const segLen = Math.max(6, percent * pathLength); // ensure visible min length
      const dasharray = `${segLen} ${pathLength - segLen}`;
      const dashoffset = Math.max(0, pathLength - (start + segLen));
      start += segLen;
      return { color: palette[idx % palette.length], dasharray, dashoffset };
    });
  };

  // Generate a professional line chart path and basic ticks for K/Z
  const buildPerformanceSeries = () => {
    const n = 10;
    const target = portfolioTotals.totalProfitLossPercent || 0;
    const trendUp = target >= 0;
    // create a smooth-ish series trending to target
    const base = trendUp ? Math.max(0, target * 0.1) : Math.min(0, target * 0.1);
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const ease = t * t * (3 - 2 * t); // smoothstep
      const noise = (Math.sin(i * 1.3) * (trendUp ? 0.6 : -0.6)) + (Math.random() - 0.5) * 0.3; // deterministic-ish look
      arr.push(base + ease * target + noise);
    }
    const minV = Math.min(...arr, 0);
    const maxV = Math.max(...arr, target);
    const scaleY = (v: number) => {
      if (maxV === minV) return 40; // avoid div by zero
      // map to 10..70
      return 70 - ((v - minV) / (maxV - minV)) * 60;
    };
    const xs = Array.from({ length: n }, (_, i) => 10 + (i * (180 / (n - 1))));
    const points = xs.map((x, i) => ({ x, y: scaleY(arr[i]) }));

    // Build a smooth path using cubic Beziers between points
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = (p1.x - p0.x) / 2;
      const c1x = p0.x + dx;
      const c1y = p0.y;
      const c2x = p1.x - dx;
      const c2y = p1.y;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
    }

    return { d, points, minV, maxV };
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#050505] text-white max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#050505] text-white max-w-md mx-auto min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 text-red-500 text-5xl">⚠️</div>
          <p className="text-red-500 mb-2">Hata Oluştu</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {transactionParams.theme == "dark" ? (
          <div className="bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#050505] text-white max-w-md mx-auto min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
      
      {/* Profile Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
        <div className="flex items-center space-x-3">
          {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.3)] animate-[avatarGlow_3s_ease-in-out_infinite_alternate]">
            <span className="text-white text-lg">👨</span>
          </div> */}
          <div>
            <h3 className="text-xl font-bold text-[#F3F4F6]">Portföy</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search size={18} className="text-[#9CA3AF]" />
          </div>
          <div className="relative">
            <Bell size={18} className="text-[#9CA3AF]" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs animate-pulse shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
              5
            </div>
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.2)] rounded-lg px-2 py-1 text-xs font-semibold text-green-500 animate-[statusPulse_2s_ease-in-out_infinite]">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse inline-block"></div>
            Açık
          </div>
          <span className="text-xs text-[#9CA3AF]">BIST 100: {bistData.value.toLocaleString("tr-TR")}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-500 font-semibold">+{bistData.changePercent.toFixed(2)}%</div>
          <div className="text-xs text-[#6B7280]">Son güncelleme: {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* Portfolio Tabs */}
      <div className="px-6 py-4 flex items-center justify-between bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[#D1D5DB]">Hisse</span>
            <span className="text-xs text-[#6B7280]">509107-118</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#D1D5DB]">Emeklilik</p>
          <p className="text-xs text-[#6B7280]">511902-130</p>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="px-6 py-6 bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#9CA3AF]">Toplam portföy değeri</span>
            <Info size={14} className="text-[#9CA3AF]" />
          </div>
          <Eye size={18} className="text-[#9CA3AF]" />
        </div>
        
        <div className="animate-[valueCount_2.5s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="flex items-end space-x-1 mb-3">
            <h2 className="font-bold text-[#F3F4F6]" style={{ fontSize: 'clamp(26px, 7vw, 48px)' }}>
              ₺{Math.floor(portfolioTotals.totalCurrentValue).toLocaleString("tr-TR")}
            </h2>
            <span className="text-[#9CA3AF]" style={{ fontSize: 'clamp(16px, 4.5vw, 28px)' }}>
              .{Math.round((portfolioTotals.totalCurrentValue % 1) * 100).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`font-semibold text-xl ${isPortfolioProfit ? 'text-green-500' : 'text-red-500'} ${isPortfolioProfit ? 'text-shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
              {isPortfolioProfit ? '+' : ''}₺{formatCurrency(Math.abs(portfolioTotals.totalProfitLoss))}
            </span>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center animate-[trendBounce_0.8s_cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_15px_rgba(16,185,129,0.2)] ${
              isPortfolioProfit 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-red-500/20 text-red-500'
            }`}>
              {isPortfolioProfit ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
              {Math.abs(portfolioTotals.totalProfitLossPercent).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 flex justify-between">
        {[
          { icon: Activity, label: "Hesap\nHareketleri" },
          { icon: TrendingUp, label: "Teknik\nAnaliz" },
          { icon: BarChart2, label: "Raporlar" },
          { icon: Download, label: "Ayarlar" }
        ].map((action, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] hover:from-[#2A2A2A] hover:to-[#3A3A3A] text-[#E5E5E5] transition-all duration-300 hover:transform hover:translate-y-[-3px] hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-[rgba(50,50,50,0.4)] hover:border-[rgba(59,130,246,0.3)] flex items-center justify-center mb-2 cursor-pointer relative overflow-hidden group">
              <action.icon size={20} className="text-[#E5E5E5] relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.15)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
            </div>
            <p className="text-xs text-[#9CA3AF] font-medium leading-tight whitespace-pre-line">
              {action.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toggle Pills - Centered */}
      <div className=" px-4 sm:px-6 py-4 flex flex-wrap justify-center gap-3">
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${
            activeTab === 'portfolio'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
              : 'bg-[rgba(20,20,20,0.9)] text-[#9CA3AF] border border-[rgba(50,50,50,0.4)] hover:bg-[rgba(30,30,30,0.9)] hover:text-[#E5E5E5] hover:transform hover:translate-y-[-1px] hover:shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
          }`}
        >
          <PieChart size={16} className="mr-2" />
          Portföy Dağılımı
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${
            activeTab === 'summary'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
              : 'bg-[rgba(20,20,20,0.9)] text-[#9CA3AF] border border-[rgba(50,50,50,0.4)] hover:bg-[rgba(30,30,30,0.9)] hover:text-[#E5E5E5] hover:transform hover:translate-y-[-1px] hover:shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
          }`}
        >
          <BarChart2 size={16} className="mr-2" />
          K/Z Özeti
        </button>
      </div>

      {/* Portfolio Chart - Only show when portfolio tab is active */}
      {activeTab === 'portfolio' && (
        <div className="px-6 py-4 bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-[360px]">
              <svg className="w-full h-auto aspect-[2/1] mt-4" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet">
                {/* Background semi-circle */}
                <path d="M 25 125 A 100 100 0 0 1 275 125" stroke="rgba(60,60,60,0.3)" strokeWidth="28" fill="none" strokeLinecap="round"/>
                
                {/* Dynamic segments */}
                {getPortfolioSegments().map((seg, i) => (
                  <path key={i} d="M 25 125 A 100 100 0 0 1 275 125" stroke={seg.color} strokeWidth="28" fill="none" strokeLinecap="round" strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset} />
                ))}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#F3F4F6]">Portföy</div>
                  <div className="text-base text-[#9CA3AF]">Dağılımı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* K/Z Summary - Only show when summary tab is active */}
      {activeTab === 'summary' && (
        <div className="px-6 py-4 bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgba(25,25,25,0.8)] rounded-xl p-4 border border-[rgba(50,50,50,0.3)] hover:bg-[rgba(30,30,30,0.8)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9CA3AF]">Toplam Yatırım</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#F3F4F6]">₺{formatCurrency(portfolioTotals.totalInvestment)}</p>
              </div>
              
              <div className="bg-[rgba(25,25,25,0.8)] rounded-xl p-4 border border-[rgba(50,50,50,0.3)] hover:bg-[rgba(30,30,30,0.8)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9CA3AF]">Güncel Değer</span>
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
                    <BarChart2 size={16} className="text-green-500" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#F3F4F6]">₺{formatCurrency(portfolioTotals.totalCurrentValue)}</p>
              </div>
            </div>

            {/* Profit/Loss Summary */}
            <div className="bg-[rgba(25,25,25,0.8)] rounded-xl p-4 border border-[rgba(50,50,50,0.3)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9CA3AF]">Kâr/Zarar Özeti</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isPortfolioProfit 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {isPortfolioProfit ? 'Kâr' : 'Zarar'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#D1D5DB]">Toplam Kâr/Zarar</span>
                  <span className={`font-semibold ${isPortfolioProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {isPortfolioProfit ? '+' : ''}{formatCurrency(Math.abs(portfolioTotals.totalProfitLoss))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#D1D5DB]">Kâr/Zarar Oranı</span>
                  <span className={`font-semibold ${isPortfolioProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {isPortfolioProfit ? '+' : ''}{Math.abs(portfolioTotals.totalProfitLossPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[rgba(25,25,25,0.8)] rounded-xl p-4 border border-[rgba(50,50,50,0.3)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9CA3AF]">Performans Grafiği</span>
                <Activity size={16} className="text-blue-500" />
              </div>
              
              <div className="h-32 bg-[rgba(20,20,20,0.5)] rounded-lg p-3 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse"></div>
                
                {/* Line Chart */}
                <svg className="w-full h-full relative z-10" viewBox="0 0 200 80">
                  {/* Definitions: grid + glow */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(60,60,60,0.3)" strokeWidth="0.5"/>
                    </pattern>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPortfolioProfit ? "#10B981" : "#EF4444"} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={isPortfolioProfit ? "#10B981" : "#EF4444"} stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>

                  {/* Background grid */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Axes */}
                  <path d="M 10 70 L 190 70" stroke="rgba(120,120,120,0.35)" strokeWidth="1" />
                  <path d="M 10 10 L 10 70" stroke="rgba(120,120,120,0.35)" strokeWidth="1" />

                  {/* Smoothed line path built from series */}
                  {(() => { const { d, points } = buildPerformanceSeries(); return (
                    <>
                      <path d={d} stroke={isPortfolioProfit ? "#10B981" : "#EF4444"} strokeWidth="2.8" fill="none" strokeLinecap="round" filter="url(#glow)" />
                      {/* Area fill under curve */}
                      <path d={`${d} L 190 80 L 10 80 Z`} fill="url(#chartGradient)" />
                      {/* Ticks on x-axis */}
                      {points.map((p, idx) => (
                        <line key={idx} x1={p.x} y1={70} x2={p.x} y2={72} stroke="rgba(120,120,120,0.4)" strokeWidth="0.6" />
                      ))}
                      {/* Last value marker */}
                      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="2.5" fill={isPortfolioProfit ? "#10B981" : "#EF4444"} />
                    </>
                  ) })()}
                  </svg>
                
                {/* Performance indicator overlay */}
                <div className="absolute top-2 right-2 text-right">
                  <div className={`text-lg font-bold ${isPortfolioProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {isPortfolioProfit ? '+' : ''}{portfolioTotals.totalProfitLossPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-[#9CA3AF]">Getiri</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock List Header */}
      <div className="px-4 sm:px-6 py-3 bg-[rgba(20,20,20,0.95)] backdrop-blur-[25px] border border-[rgba(40,40,40,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-b border-[rgba(50,50,50,0.4)]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#F3F4F6]">Portföy Detayları</h3>
          <div className="flex items-center space-x-3">
            <button className="text-xs text-[#9CA3AF] hover:text-[#D1D5DB] transition-colors flex items-center">
              <SortDesc size={14} className="mr-1" />
              Sırala
            </button>
            <button className="text-xs text-[#9CA3AF] hover:text-[#D1D5DB] transition-colors flex items-center">
              <Filter size={14} className="mr-1" />
              Filtrele
            </button>
            <button className="text-xs text-[#9CA3AF] hover:text-[#D1D5DB] transition-colors flex items-center">
              <Download size={14} className="mr-1" />
              İndir
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="pb-24">
        {portfolioData.map((stock, index) => {
          const stockValue = stock.last_price * stock.shares;
          const stockInvestment = stock.entryPrice * stock.shares;
          const stockProfitLoss = stockValue - stockInvestment;
          const isStockProfit = stockProfitLoss >= 0;
          const riskLevel = getRiskLevel(stock.daily_change_percent);

          return (
            <div
               key={stock.code}
              className="flex items-center justify-between gap-3 py-4 px-3 my-1 bg-[rgba(20,20,20,0.95)] cursor-pointer group relative"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={getStockLogo(stock.code, stock.logo_url)} 
                    alt={stock.code}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=${stock.code.charAt(0)}`;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    <p className="font-bold text-[#F3F4F6] text-base truncate">{stock.code}</p>

                    <span className="px-2 py-0.5 bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(59,130,246,0.03)] border border-[rgba(59,130,246,0.2)] rounded text-blue-400 text-xs">
                    ₺{stock.last_price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-[#9CA3AF] truncate">{getShortStockName(stock.name)}</p>
                  <p className="text-sm text-[#6B7280]">Maliyet: ₺{stock.entryPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right ml-auto max-w-[42%] sm:max-w-none leading-tight">
                <p className="font-bold text-[#F3F4F6] font-[700] tracking-[0.5px]" style={{ fontSize: 'clamp(13px, 3.8vw, 18px)' }}>₺{formatCurrency(stockValue)}</p>
                <div className="flex items-center space-x-2 justify-end">
                  <span className={`font-medium ${isStockProfit ? 'text-green-500' : 'text-red-500'} font-[700] tracking-[0.5px]`} style={{ fontSize: 'clamp(11px, 3.6vw, 16px)' }}>
                    {isStockProfit ? '+' : ''}₺{formatCurrency(Math.abs(stockProfitLoss))}
                  </span>
                  <span className={`font-medium ${stock.daily_change_percent >= 0 ? 'text-green-500' : 'text-red-500'} font-[700] tracking-[0.5px]`} style={{ fontSize: 'clamp(11px, 3.6vw, 16px)' }}>
                    {stock.daily_change_percent >= 0 ? '+' : ''}{stock.daily_change_percent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-1">{stock.shares.toLocaleString()} adet</p>
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-[rgba(50,50,50,0.4)] px-6 py-4 max-w-md mx-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <div className="flex justify-between items-center">
          {[
            { icon: Home, label: "Ana Sayfa", active: false },
            { icon: TrendingUp, label: "Piyasa", active: false },
            { icon: Briefcase, label: "Portföyüm", active: true },
            { icon: List, label: "Emirlerim", active: false },
            { icon: Lightbulb, label: "Fikirler", active: false }
          ].map((nav, index) => (
            <div key={index} className="text-center flex flex-col items-center justify-center">
              <nav.icon size={24} className={nav.active ? 'text-green-500' : 'text-[#9CA3AF] hover:text-[#E5E5E5] hover:transform hover:translate-y-[-2px] transition-all duration-300'} />
              <span className={`text-xs mt-1 block transition-all duration-300 ${
                nav.active 
                  ? 'text-green-500 font-semibold bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.03)] rounded-xl px-3 py-2' 
                  : 'text-[#9CA3AF] hover:text-[#E5E5E5]'
              }`}>
                {nav.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes avatarGlow {
          from { box-shadow: 0 0 25px rgba(59, 130, 246, 0.3); }
          to { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes valueCount {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes trendBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        @keyframes chartAppear {
          from {
            opacity: 0;
            transform: scale(0.7) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes segmentDraw {
          from { stroke-dasharray: 0 330; }
          to { stroke-dasharray: var(--final-dash); }
        }
        
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes drawLine {
          from { stroke-dasharray: 0 1000; }
          to { stroke-dasharray: 1000 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
    ): (
      <div className="bg-gradient-to-br from-[#FAFAFA] via-[#F5F5F5] to-[#FFFFFF] text-gray-900 max-w-md mx-auto min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
      
      {/* Profile Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)]" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
        <div className="flex items-center space-x-3">
          {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.3)] animate-[avatarGlow_3s_ease-in-out_infinite_alternate]">
            <span className="text-white text-lg">👨</span>
          </div> */}
          <div>
            <h3 className="text-xl font-bold text-[#1F2937]">Portföy</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search size={18} className="text-[#6B7280]" />
          </div>
          <div className="relative">
            <Bell size={18} className="text-[#6B7280]" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs animate-pulse shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
              5
            </div>
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.2)] rounded-lg px-2 py-1 text-xs font-semibold text-green-600 animate-[statusPulse_2s_ease-in-out_infinite]">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse inline-block"></div>
            Açık
          </div>
          <span className="text-xs text-[#6B7280]">BIST 100: {bistData.value.toLocaleString("tr-TR")}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-600 font-semibold">+{bistData.changePercent.toFixed(2)}%</div>
          <div className="text-xs text-[#9CA3AF]">Son güncelleme: {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* Portfolio Tabs */}
      <div className="px-6 py-4 flex items-center justify-between bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[#374151]">Hisse</span>
            <span className="text-xs text-[#9CA3AF]">509107-118</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#374151]">Emeklilik</p>
          <p className="text-xs text-[#9CA3AF]">511902-130</p>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="px-6 py-6 bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#6B7280]">Toplam portföy değeri</span>
            <Info size={14} className="text-[#6B7280]" />
          </div>
          <Eye size={18} className="text-[#6B7280]" />
        </div>
        
        <div className="animate-[valueCount_2.5s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="flex items-end space-x-1 mb-3">
            <h2 className="font-bold text-[#1F2937]" style={{ fontSize: 'clamp(26px, 7vw, 48px)' }}>
              ₺{Math.floor(portfolioTotals.totalCurrentValue).toLocaleString("tr-TR")}
            </h2>
            <span className="text-[#6B7280]" style={{ fontSize: 'clamp(16px, 4.5vw, 28px)' }}>
              .{Math.round((portfolioTotals.totalCurrentValue % 1) * 100).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`font-semibold text-xl ${isPortfolioProfit ? 'text-green-600' : 'text-red-600'} ${isPortfolioProfit ? 'text-shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
              {isPortfolioProfit ? '+' : ''}₺{formatCurrency(Math.abs(portfolioTotals.totalProfitLoss))}
            </span>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center animate-[trendBounce_0.8s_cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_15px_rgba(16,185,129,0.2)] ${
              isPortfolioProfit 
                ? 'bg-green-500/20 text-green-600' 
                : 'bg-red-500/20 text-red-600'
            }`}>
              {isPortfolioProfit ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
              {Math.abs(portfolioTotals.totalProfitLossPercent).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 flex justify-between">
        {[
          { icon: Activity, label: "Hesap\nHareketleri" },
          { icon: TrendingUp, label: "Teknik\nAnaliz" },
          { icon: BarChart2, label: "Raporlar" },
          { icon: Download, label: "Ayarlar" }
        ].map((action, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] hover:from-[#E5E7EB] hover:to-[#D1D5DB] text-[#374151] transition-all duration-300 hover:transform hover:translate-y-[-3px] hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[rgba(209,213,219,0.4)] hover:border-[rgba(59,130,246,0.3)] flex items-center justify-center mb-2 cursor-pointer relative overflow-hidden group">
              <action.icon size={20} className="text-[#374151] relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.15)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
            </div>
            <p className="text-xs text-[#6B7280] font-medium leading-tight whitespace-pre-line">
              {action.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toggle Pills - Centered */}
      <div className=" px-4 sm:px-6 py-4 flex flex-wrap justify-center gap-3">
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${
            activeTab === 'portfolio'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
              : 'bg-[rgba(255,255,255,0.9)] text-[#6B7280] border border-[rgba(209,213,219,0.4)] hover:bg-[rgba(249,250,251,0.9)] hover:text-[#374151] hover:transform hover:translate-y-[-1px] hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
          }`}
        >
          <PieChart size={16} className="mr-2" />
          Portföy Dağılımı
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${
            activeTab === 'summary'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
              : 'bg-[rgba(255,255,255,0.9)] text-[#6B7280] border border-[rgba(209,213,219,0.4)] hover:bg-[rgba(249,250,251,0.9)] hover:text-[#374151] hover:transform hover:translate-y-[-1px] hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
          }`}
        >
          <BarChart2 size={16} className="mr-2" />
          K/Z Özeti
        </button>
      </div>

      {/* Portfolio Chart - Only show when portfolio tab is active */}
      {activeTab === 'portfolio' && (
        <div className="px-6 py-4 bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-[360px]">
              <svg className="w-full h-auto aspect-[2/1] mt-4" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet">
                {/* Background semi-circle */}
                <path d="M 25 125 A 100 100 0 0 1 275 125" stroke="rgba(200,200,200,0.3)" strokeWidth="28" fill="none" strokeLinecap="round"/>
                
                {/* Dynamic segments */}
                {getPortfolioSegments().map((seg, i) => (
                  <path key={i} d="M 25 125 A 100 100 0 0 1 275 125" stroke={seg.color} strokeWidth="28" fill="none" strokeLinecap="round" strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset} />
                ))}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#1F2937]">Portföy</div>
                  <div className="text-base text-[#6B7280]">Dağılımı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* K/Z Summary - Only show when summary tab is active */}
      {activeTab === 'summary' && (
        <div className="px-6 py-4 bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgba(249,250,251,0.8)] rounded-xl p-4 border border-[rgba(209,213,219,0.3)] hover:bg-[rgba(243,244,246,0.8)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Toplam Yatırım</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#1F2937]">₺{formatCurrency(portfolioTotals.totalInvestment)}</p>
              </div>
              
              <div className="bg-[rgba(249,250,251,0.8)] rounded-xl p-4 border border-[rgba(209,213,219,0.3)] hover:bg-[rgba(243,244,246,0.8)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Güncel Değer</span>
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
                    <BarChart2 size={16} className="text-green-500" />
                  </div>
                </div>
                <p className="text-xl font-bold text-[#1F2937]">₺{formatCurrency(portfolioTotals.totalCurrentValue)}</p>
              </div>
            </div>

            {/* Profit/Loss Summary */}
            <div className="bg-[rgba(249,250,251,0.8)] rounded-xl p-4 border border-[rgba(209,213,219,0.3)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#6B7280]">Kâr/Zarar Özeti</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isPortfolioProfit 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-red-500/20 text-red-600'
                }`}>
                  {isPortfolioProfit ? 'Kâr' : 'Zarar'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#374151]">Toplam Kâr/Zarar</span>
                  <span className={`font-semibold ${isPortfolioProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isPortfolioProfit ? '+' : ''}{formatCurrency(Math.abs(portfolioTotals.totalProfitLoss))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#374151]">Kâr/Zarar Oranı</span>
                  <span className={`font-semibold ${isPortfolioProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isPortfolioProfit ? '+' : ''}{Math.abs(portfolioTotals.totalProfitLossPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[rgba(249,250,251,0.8)] rounded-xl p-4 border border-[rgba(209,213,219,0.3)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#6B7280]">Performans Grafiği</span>
                <Activity size={16} className="text-blue-500" />
              </div>
              
              <div className="h-32 bg-[rgba(243,244,246,0.5)] rounded-lg p-3 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse"></div>
                
                {/* Line Chart */}
                <svg className="w-full h-full relative z-10" viewBox="0 0 200 80">
                  {/* Definitions: grid + glow */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth="0.5"/>
                    </pattern>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPortfolioProfit ? "#10B981" : "#EF4444"} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={isPortfolioProfit ? "#10B981" : "#EF4444"} stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>

                  {/* Background grid */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Axes */}
                  <path d="M 10 70 L 190 70" stroke="rgba(156,163,175,0.35)" strokeWidth="1" />
                  <path d="M 10 10 L 10 70" stroke="rgba(156,163,175,0.35)" strokeWidth="1" />

                  {/* Smoothed line path built from series */}
                  {(() => { const { d, points } = buildPerformanceSeries(); return (
                    <>
                      <path d={d} stroke={isPortfolioProfit ? "#10B981" : "#EF4444"} strokeWidth="2.8" fill="none" strokeLinecap="round" filter="url(#glow)" />
                      {/* Area fill under curve */}
                      <path d={`${d} L 190 80 L 10 80 Z`} fill="url(#chartGradient)" />
                      {/* Ticks on x-axis */}
                      {points.map((p, idx) => (
                        <line key={idx} x1={p.x} y1={70} x2={p.x} y2={72} stroke="rgba(156,163,175,0.4)" strokeWidth="0.6" />
                      ))}
                      {/* Last value marker */}
                      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="2.5" fill={isPortfolioProfit ? "#10B981" : "#EF4444"} />
                    </>
                  ) })()}
                  </svg>
                
                {/* Performance indicator overlay */}
                <div className="absolute top-2 right-2 text-right">
                  <div className={`text-lg font-bold ${isPortfolioProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isPortfolioProfit ? '+' : ''}{portfolioTotals.totalProfitLossPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-[#6B7280]">Getiri</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock List Header */}
      <div className="px-4 sm:px-6 py-3 bg-[rgba(255,255,255,0.95)] backdrop-blur-[25px] border border-[rgba(220,220,220,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-b border-[rgba(209,213,219,0.4)]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1F2937]">Portföy Detayları</h3>
          <div className="flex items-center space-x-3">
            <button className="text-xs text-[#6B7280] hover:text-[#374151] transition-colors flex items-center">
              <SortDesc size={14} className="mr-1" />
              Sırala
            </button>
            <button className="text-xs text-[#6B7280] hover:text-[#374151] transition-colors flex items-center">
              <Filter size={14} className="mr-1" />
              Filtrele
            </button>
            <button className="text-xs text-[#6B7280] hover:text-[#374151] transition-colors flex items-center">
              <Download size={14} className="mr-1" />
              İndir
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="pb-24">
        {portfolioData.map((stock, index) => {
          const stockValue = stock.last_price * stock.shares;
          const stockInvestment = stock.entryPrice * stock.shares;
          const stockProfitLoss = stockValue - stockInvestment;
          const isStockProfit = stockProfitLoss >= 0;
          const riskLevel = getRiskLevel(stock.daily_change_percent);

          return (
            <div
               key={stock.code}
              className="flex items-center justify-between gap-3 py-4 px-3 my-1 bg-[rgba(255,255,255,0.95)] cursor-pointer group relative"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={getStockLogo(stock.code, stock.logo_url)} 
                    alt={stock.code}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=${stock.code.charAt(0)}`;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    <p className="font-bold text-[#1F2937] text-base truncate">{stock.code}</p>

                    <span className="px-2 py-0.5 bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(59,130,246,0.03)] border border-[rgba(59,130,246,0.2)] rounded text-blue-600 text-xs">
                    ₺{stock.last_price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280] truncate">{getShortStockName(stock.name)}</p>
                  <p className="text-sm text-[#9CA3AF]">Maliyet: ₺{stock.entryPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right ml-auto max-w-[42%] sm:max-w-none leading-tight">
                <p className="font-bold text-[#1F2937] font-[700] tracking-[0.5px]" style={{ fontSize: 'clamp(13px, 3.8vw, 18px)' }}>₺{formatCurrency(stockValue)}</p>
                <div className="flex items-center space-x-2 justify-end">
                  <span className={`font-medium ${isStockProfit ? 'text-green-600' : 'text-red-600'} font-[700] tracking-[0.5px]`} style={{ fontSize: 'clamp(11px, 3.6vw, 16px)' }}>
                    {isStockProfit ? '+' : ''}₺{formatCurrency(Math.abs(stockProfitLoss))}
                  </span>
                  <span className={`font-medium ${stock.daily_change_percent >= 0 ? 'text-green-600' : 'text-red-600'} font-[700] tracking-[0.5px]`} style={{ fontSize: 'clamp(11px, 3.6vw, 16px)' }}>
                    {stock.daily_change_percent >= 0 ? '+' : ''}{stock.daily_change_percent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-[#9CA3AF] mt-1">{stock.shares.toLocaleString()} adet</p>
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[rgba(209,213,219,0.4)] px-6 py-4 max-w-md mx-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <div className="flex justify-between items-center">
          {[
            { icon: Home, label: "Ana Sayfa", active: false },
            { icon: TrendingUp, label: "Piyasa", active: false },
            { icon: Briefcase, label: "Portföyüm", active: true },
            { icon: List, label: "Emirlerim", active: false },
            { icon: Lightbulb, label: "Fikirler", active: false }
          ].map((nav, index) => (
            <div key={index} className="text-center flex flex-col items-center justify-center">
              <nav.icon size={24} className={nav.active ? 'text-green-600' : 'text-[#6B7280] hover:text-[#374151] hover:transform hover:translate-y-[-2px] transition-all duration-300'} />
              <span className={`text-xs mt-1 block transition-all duration-300 ${
                nav.active 
                  ? 'text-green-600 font-semibold bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.03)] rounded-xl px-3 py-2' 
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}>
                {nav.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes avatarGlow {
          from { box-shadow: 0 0 25px rgba(59, 130, 246, 0.3); }
          to { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes valueCount {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes trendBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        @keyframes chartAppear {
          from {
            opacity: 0;
            transform: scale(0.7) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes segmentDraw {
          from { stroke-dasharray: 0 330; }
          to { stroke-dasharray: var(--final-dash); }
        }
        
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes drawLine {
          from { stroke-dasharray: 0 1000; }
          to { stroke-dasharray: 1000 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
    )}
    
    </>
  );
};

export default PortfolioView;
