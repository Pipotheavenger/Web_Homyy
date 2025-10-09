export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎉 ¡Tailwind CSS está funcionando!
        </h1>
        <p className="text-gray-600 mb-4">
          Si ves este mensaje con estilos, Tailwind está funcionando correctamente.
        </p>
        <div className="flex gap-4">
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
            Botón 1
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
            Botón 2
          </button>
        </div>
      </div>
    </div>
  );
}




