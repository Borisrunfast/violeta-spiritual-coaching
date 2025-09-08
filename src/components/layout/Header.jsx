// src/components/layout/Header.jsx
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-secondary">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <div className="text-2xl font-extrabold text-primary tracking-wide">
            Violeta Amaya
          </div>
        </Link>

        <nav className="space-x-6 hidden md:flex">
          <a href="#coaching" className="text-text hover:text-primary transition font-medium">
            Coaching
          </a>
          <a href="#donation" className="text-text hover:text-primary transition font-medium">
            Donate
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
