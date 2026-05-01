/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CurrencyConverter from './components/CurrencyConverter';

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-ink selection:text-brand-bg">
      <CurrencyConverter />
    </div>
  );
}
