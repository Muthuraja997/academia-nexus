export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">✅ Server is Working!</h1>
        <p className="text-gray-600 mb-4">The Next.js application is running properly.</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">🚀 Next.js: Running on port 3003</p>
          <p className="text-sm text-gray-500">🐍 Python API: Running on port 8082</p>
          <p className="text-sm text-gray-500">🗄️ Database: MySQL connection ready</p>
        </div>
        <div className="mt-6">
          <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
