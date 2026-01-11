import { ProductList } from './components/ProductList'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20">
      <header className="border-b bg-white px-6 py-4 flex items-center gap-3">
        <img src="/monk-logo-new.png" alt="Monk logo" className="h-8" />
        <span className="text-xl font-bold tracking-tight text-slate-700">Monk Upsell & Cross-sell</span>
      </header>
      <main>
        <ProductList />
      </main>
    </div>
  )
}

export default App
