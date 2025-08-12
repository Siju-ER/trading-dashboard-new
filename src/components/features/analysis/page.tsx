'use client';

import Feature from '../Feature';

export default function Analysis() {
  const headerActions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        New Order
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Market Scan
      </button>
    </div>
  );

  return (
    <Feature 
      title="Trading Center"
      subtitle="Execute trades, monitor positions, and manage your orders"
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Interface */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Order Entry</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Symbol</label>
              <input 
                type="text" 
                placeholder="Enter symbol (e.g., AAPL)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                <input 
                  type="number" 
                  placeholder="100"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label>
                <input 
                  type="number" 
                  placeholder="Market"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Buy
              </button>
              <button className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Sell
              </button>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Active Orders</h2>
          <p className="text-slate-500 dark:text-slate-400">No active orders</p>
        </div>
      </div>
    </Feature>
  );
}

