import { Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

interface PortfolioProps {
  virtualBalance: number;
  holdings: Record<string, number>;
}

const mockCoins = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 43250.50, change24h: 2.5 },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 2285.75, change24h: 3.2 },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', price: 315.20, change24h: -1.2 },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 98.45, change24h: 5.8 },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: 1.5 },
];

export function Portfolio({ virtualBalance, holdings }: PortfolioProps) {
  // Calculate portfolio value
  const portfolioAssets = Object.entries(holdings)
    .filter(([_, amount]) => amount > 0)
    .map(([coinId, amount]) => {
      const coin = mockCoins.find(c => c.id === coinId);
      if (!coin) return null;
      
      const value = amount * coin.price;
      return {
        ...coin,
        amount,
        value
      };
    })
    .filter(Boolean);

  const totalPortfolioValue = portfolioAssets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
  const totalValue = virtualBalance + totalPortfolioValue;
  const initialBalance = 10000;
  const profitLoss = totalValue - initialBalance;
  const profitLossPercent = ((profitLoss / initialBalance) * 100).toFixed(2);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-black">My Portfolio</h1>
        <p className="text-black/60">Track your virtual holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Balance */}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-black/60">
            <Wallet className="h-4 w-4" />
            Total Balance
          </div>
          <div className="mb-1 text-3xl font-bold text-black">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-black/60">
            Cash: ${virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-black/60">
            <PieChart className="h-4 w-4" />
            Portfolio Value
          </div>
          <div className="mb-1 text-3xl font-bold text-black">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-black/60">
            {portfolioAssets.length} {portfolioAssets.length === 1 ? 'Asset' : 'Assets'}
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-black/60">
            {profitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            Total Profit/Loss
          </div>
          <div className={`mb-1 text-3xl font-bold ${
            profitLoss >= 0 ? 'text-[#9EEC37]' : 'text-black/40'
          }`}>
            {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${
            profitLoss >= 0 ? 'text-[#9EEC37]' : 'text-black/40'
          }`}>
            {profitLoss >= 0 ? '+' : ''}{profitLossPercent}%
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="mb-8">
        <h2 className="mb-4 font-bold text-black">Your Holdings</h2>
        
        {portfolioAssets.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black/10 bg-black/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black/60">Asset</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-black/60">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-black/60">Price</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-black/60">24h Change</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-black/60">Value</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-black/60">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {portfolioAssets.map((asset) => {
                    if (!asset) return null;
                    const allocation = ((asset.value / totalPortfolioValue) * 100).toFixed(1);
                    
                    return (
                      <tr key={asset.id} className="transition-colors hover:bg-black/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37]/20 font-bold text-black">
                              {asset.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-black">{asset.name}</div>
                              <div className="text-sm text-black/60">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-black">
                          {asset.amount.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 text-right text-black">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={asset.change24h >= 0 ? 'text-[#9EEC37]' : 'text-black/40'}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-black">
                          ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-black/10">
                              <div
                                className="h-full bg-[#9EEC37]"
                                style={{ width: `${allocation}%` }}
                              />
                            </div>
                            <span className="text-sm text-black/60">{allocation}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-black/10 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#9EEC37]/20">
                <PieChart className="h-8 w-8 text-black" />
              </div>
            </div>
            <h3 className="mb-2 font-bold text-black">No Holdings Yet</h3>
            <p className="mb-6 text-black/60">
              Start trading to build your portfolio
            </p>
          </div>
        )}
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-black">Recent Activity</h3>
          <div className="space-y-3">
            {portfolioAssets.length > 0 ? (
              portfolioAssets.slice(0, 3).map((asset) => {
                if (!asset) return null;
                return (
                  <div key={asset.id} className="flex items-center justify-between rounded-lg border border-black/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9EEC37]/20 text-sm font-bold text-black">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">Purchased {asset.symbol}</div>
                        <div className="text-xs text-black/60">{asset.amount.toFixed(4)} coins</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-center text-sm text-black/60">No recent activity</p>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-black">Performance Insights</h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-[#9EEC37]/10 p-4">
              <div className="mb-1 text-sm text-black/60">Starting Balance</div>
              <div className="font-bold text-black">$10,000.00</div>
            </div>
            <div className="rounded-lg bg-black/5 p-4">
              <div className="mb-1 text-sm text-black/60">Current Balance</div>
              <div className="font-bold text-black">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${
              profitLoss >= 0 ? 'bg-[#9EEC37]/10' : 'bg-black/5'
            }`}>
              <div className="mb-1 text-sm text-black/60">Net Change</div>
              <div className={`font-bold ${
                profitLoss >= 0 ? 'text-[#9EEC37]' : 'text-black/40'
              }`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="ml-2 text-sm">({profitLoss >= 0 ? '+' : ''}{profitLossPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
