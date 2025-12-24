export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="mx-auto max-w-7xl grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold">PeerPicks</h3>
          <p className="text-sm mt-2">Community-powered ratings.</p>
        </div>
        <div>
          <h4 className="text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Home</li>
            <li>About</li>
            <li>Top Ratings</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white">Categories</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Restaurants</li>
            <li>Cafes</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white">Contact</h4>
          <p className="text-sm mt-3">info@peerpicks.com</p>
        </div>
      </div>
      <p className="mt-10 text-center text-sm">
        © {new Date().getFullYear()} PeerPicks
      </p>
    </footer>
  );
}
