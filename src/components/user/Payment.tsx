import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function Payment() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
        <p className="text-zinc-400">Manage your premium coaching plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-brand/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PRO</div>
            <h3 className="font-semibold text-white text-xl mb-2">Premium Coaching</h3>
            <p className="text-zinc-400 mb-6">Your current plan includes personalized diet plans, weekly check-ins, and 24/7 chat support.</p>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-zinc-400 mb-1">/month</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> Custom Diet Plans
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> Weekly Check-ins
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand" /> Direct Chat with Coach
              </div>
            </div>

            <div className="flex gap-4">
              <button className="bg-zinc-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                Cancel Plan
              </button>
              <button className="bg-brand text-black px-6 py-2 rounded-lg font-bold hover:bg-brand-hover transition-colors">
                Upgrade to Elite
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">Payment Methods</div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Visa ending in 4242</p>
                    <p className="text-xs text-zinc-500">Expires 12/25</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-300 rounded-full">Default</span>
              </div>
              <button className="text-sm font-medium text-brand hover:text-brand-hover">
                + Add new payment method
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-semibold text-white">Billing History</div>
            <div className="divide-y divide-zinc-800">
              {[
                { date: 'Oct 1, 2023', amount: '$99.00', status: 'Paid' },
                { date: 'Sep 1, 2023', amount: '$99.00', status: 'Paid' },
                { date: 'Aug 1, 2023', amount: '$99.00', status: 'Paid' },
              ].map((invoice, i) => (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-white text-sm">{invoice.date}</p>
                    <p className="text-xs text-brand">{invoice.status}</p>
                  </div>
                  <span className="text-sm font-medium text-white">{invoice.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
