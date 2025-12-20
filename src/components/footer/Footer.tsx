import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-6 pt-4 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center gap-6">
          <Link to="/datenschutz" className="hover:text-gray-700 transition-colors">
            Datenschutz
          </Link>
          <span>|</span>
          <Link to="/impressum" className="hover:text-gray-700 transition-colors">
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  );
}
