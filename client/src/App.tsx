import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Market } from './components/Market';
import { PracticeTrading } from './components/PracticeTrading';
import { Learn } from './components/Learn';
import { Community } from './components/Community';
import { Portfolio } from './components/Portfolio';
import { News } from './components/News';
import { Chatbot } from './components/Chatbot';
import { Logo } from './components/Logo';
import Auth from "./components/AuthPage";



type Page = 'dashboard' | 'market' | 'trading' | 'news' | 'community';

// ✅ onNavigate hỗ trợ truyền coinId (optional)
type NavigateFn = (page: Page, coinId?: string) => void;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [virtualBalance, setVirtualBalance] = useState(10000);
  const [holdings, setHoldings] = useState<Record<string, number>>({});
  const [authed, setAuthed] = useState(false);


  // ✅ coin được chọn từ Market để auto-select trong PracticeTrading
  const [tradeCoinId, setTradeCoinId] = useState<string | undefined>(undefined);

  // ✅ thay vì truyền trực tiếp setCurrentPage, dùng hàm này để nhận coinId
  const onNavigate: NavigateFn = (page, coinId) => {
    setCurrentPage(page);
    if (page === 'trading') setTradeCoinId(coinId);
  };

  const handleBuy = (coinId: string, amount: number, price: number) => {
    const totalCost = amount * price;
    if (totalCost <= virtualBalance) {
      setVirtualBalance((prev) => prev - totalCost);
      setHoldings((prev) => ({
        ...prev,
        [coinId]: (prev[coinId] || 0) + amount,
      }));
    }
  };

  const handleSell = (coinId: string, amount: number, price: number) => {
    if (holdings[coinId] && holdings[coinId] >= amount) {
      const totalValue = amount * price;
      setVirtualBalance((prev) => prev + totalValue);
      setHoldings((prev) => ({
        ...prev,
        [coinId]: prev[coinId] - amount,
      }));
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={onNavigate} virtualBalance={virtualBalance} holdings={holdings} />;
      case 'market':
        return <Market onNavigate={onNavigate} />;
      case 'trading':
        return (
          <PracticeTrading
            virtualBalance={virtualBalance}
            onBuy={handleBuy}
            onSell={handleSell}
            initialCoinId={tradeCoinId} // ✅ auto select coin
          />
        );
      case 'news':
        return <News />;
      case 'community':
        return <Community />;
      default:
        return <Dashboard onNavigate={onNavigate} virtualBalance={virtualBalance} holdings={holdings} />;
    }
  };
  if (!authed) {
    return <Auth onAuthed={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center transition-opacity hover:opacity-80"
            >
              <Logo size="lg" />
            </button>

            {/* Navigation - Hidden on mobile, show on md+ */}
            <nav className="hidden md:flex gap-8">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'market', label: 'Thị trường' },
                { id: 'trading', label: 'Giao dịch ảo' },
                { id: 'news', label: 'Tin tức' },
                { id: 'community', label: 'Cộng đồng' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as Page)}
                  className={`relative px-1 py-1 transition-colors hover:text-black ${currentPage === item.id ? 'text-black' : 'text-black/60'
                    }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9EEC37]" />
                  )}
                </button>
              ))}
            </nav>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm">
                <span className="text-black/60">Số dư:</span>
                <span className="font-medium">
                  ${virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37] font-medium text-black">
                U
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden gap-4 overflow-x-auto pb-3 -mx-6 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'market', label: 'Thị trường' },
              { id: 'trading', label: 'Giao dịch ảo' },
              { id: 'news', label: 'Tin tức' },
              { id: 'community', label: 'Cộng đồng' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${currentPage === item.id ? 'bg-[#9EEC37] text-black' : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{renderPage()}</main>

      {/* Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <Logo size="lg" className="mb-4" />
              <p className="text-sm text-black/60 max-w-md">
                Nền tảng học tập và giao dịch mô phỏng tiền điện tử dành cho người mới bắt đầu. Thực hành an toàn với
                tiền ảo, học hỏi từ cộng đồng.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 font-medium text-black">Liên kết nhanh</h4>
              <ul className="space-y-2 text-sm text-black/60">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-black transition-colors">
                    Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('market')} className="hover:text-black transition-colors">
                    Thị trường
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('trading')} className="hover:text-black transition-colors">
                    Giao dịch ảo
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('community')} className="hover:text-black transition-colors">
                    Cộng đồng
                  </button>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="mb-4 font-medium text-black">Thông tin</h4>
              <ul className="space-y-2 text-sm text-black/60">
                <li>Về chúng tôi</li>
                <li>Điều khoản sử dụng</li>
                <li>Chính sách bảo mật</li>
                <li>Liên hệ</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-black/10 text-center text-sm text-black/60">
            <p>CoinSight là nền tảng mô phỏng đầu tư và cung cấp thông tin về coin, không phải tư vấn tài chính.</p>
            <p className="mt-2">© 2026 CoinSight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
