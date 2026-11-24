import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, PORTFOLIO_BUCKET, PORTFOLIO_FILE } from './lib/supabase';
import './App.css';

const REFRESH_INTERVAL_MS = 30_000;

function App() {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('not-configured');
      return undefined;
    }

    let cancelled = false;

    async function loadPortfolio() {
      try {
        const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(PORTFOLIO_FILE);
        const url = new URL(data.publicUrl);
        url.searchParams.set('v', Date.now().toString());

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Portfolio HTML request failed (${response.status})`);
        const content = await response.text();
        if (!content.trim()) throw new Error('The portfolio HTML file is empty.');

        if (!cancelled) {
          setHtml(content);
          setStatus('ready');
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus((current) => current === 'ready' ? current : 'error');
      }
    }

    loadPortfolio();
    const intervalId = window.setInterval(loadPortfolio, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="shell">
      <div className="topbar">
        <a className="brand" href="/" aria-label="Portfolio home">IR<span>.</span></a>
        <span className="live-indicator"><span className="dot" /> LIVE PORTFOLIO</span>
      </div>

      <section className="content" aria-live="polite">
        {status === 'loading' && (
          <div className="state-card"><span className="spinner" /><p>Loading portfolio…</p></div>
        )}
        {status === 'not-configured' && (
          <div className="state-card">
            <p className="eyebrow">SETUP REQUIRED</p>
            <h1>Almost there.</h1>
            <p>Add your Supabase environment variables to load the portfolio content.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="state-card">
            <p className="eyebrow">CONNECTION ISSUE</p>
            <h1>Couldn't load the portfolio.</h1>
            <p>Check the Supabase Storage file and connection, then try again.</p>
          </div>
        )}
        {status === 'ready' && (
          <div className="portfolio-frame">
            <iframe title="Portfolio content" srcDoc={html} sandbox="allow-scripts" />
          </div>
        )}
      </section>

      <footer className="footer">
        <span>Built with React · Content managed through Supabase</span>
        {lastUpdated && <span>Synced {lastUpdated.toLocaleTimeString()}</span>}
      </footer>
    </main>
  );
}

export default App;