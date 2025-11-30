import React, { useState, useEffect } from 'react';
import { IconBone, IconRuler, IconLoader } from './components/Icons';
import { predictNailSize, loadModelFromServer, loadModelFromCache } from './services/modelSimulation';
import { AppState, PredictionResult } from './types';
import { ResultCard } from './components/ResultCard';

const App: React.FC = () => {
  const [height, setHeight] = useState<string>('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [usingRealModel, setUsingRealModel] = useState<boolean>(false);

  // Lógica de carga inteligente al iniciar
  useEffect(() => {
    const initModel = async () => {
      // 1. Intentar cargar desde memoria del navegador
      const loadedFromCache = await loadModelFromCache();
      if (loadedFromCache) {
        setUsingRealModel(true);
        return;
      }

      // 2. Si no hay caché, intentar cargar del servidor
      const loadedFromServer = await loadModelFromServer();
      if (loadedFromServer) {
        setUsingRealModel(true);
      }
    };
    initModel();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!height) return;

    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
      alert("Por favor ingrese una talla válida (50cm - 250cm)");
      return;
    }

    setAppState(AppState.CALCULATING);
    setResults([]);

    try {
      const predictions = await predictNailSize(heightNum);
      setResults(predictions);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setHeight('');
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-medical-200 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-medical-700">
            <div className="bg-medical-100 p-2 rounded-lg">
              <IconBone className="w-5 h-5 text-medical-600" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">NailPredict AI</h1>
          </div>
          {appState === AppState.SUCCESS && (
             <button 
             onClick={reset}
             className="text-sm font-medium text-slate-500 hover:text-medical-600 transition-colors"
           >
             Nueva Consulta
           </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 flex-grow w-full">
        
        {/* Intro Text */}
        {appState === AppState.IDLE && (
          <div className="mb-8 text-center space-y-2 fade-in">
            <h2 className="text-2xl font-bold text-slate-900">Predicción de clavo de tibia</h2>
            <p className="text-slate-500 text-sm">
              Ingrese la talla del paciente para obtener predicciones.
            </p>
          </div>
        )}

        {/* Form */}
        <div className={`transition-all duration-500 ${appState === AppState.SUCCESS ? 'mb-8 opacity-50 pointer-events-none grayscale' : 'mb-8'}`}>
          <form onSubmit={handlePredict} className="glass-panel p-6 rounded-2xl shadow-sm bg-white">
            <label htmlFor="height" className="block text-sm font-semibold text-slate-700 mb-2">
              Talla del Paciente (cm)
            </label>
            <div className="relative flex items-center mb-6 group">
              <IconRuler className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
              <input
                id="height"
                type="number"
                placeholder="Ej. 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all placeholder:text-slate-300"
                autoFocus
              />
              <span className="absolute right-4 text-slate-400 font-medium">cm</span>
            </div>

            <button
              type="submit"
              disabled={!height || appState === AppState.CALCULATING}
              className={`
                w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-medical-500/30
                flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                ${appState === AppState.CALCULATING ? 'bg-medical-400 cursor-wait' : 'bg-medical-600 hover:bg-medical-700'}
              `}
            >
              {appState === AppState.CALCULATING ? (
                <>
                  <IconLoader className="w-5 h-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  Calcular Opciones
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {appState === AppState.SUCCESS && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900">Resultados Sugeridos</h3>
            </div>
            
            {/* Primary Option */}
            {results.length > 0 && (
              <ResultCard result={results[0]} isPrimary />
            )}

            {/* Secondary Options Grid */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {results.slice(1).map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </div>

            <p className="text-xs text-center text-slate-400 mt-8 leading-relaxed px-4">
              * Los resultados son sugerencias basadas en el análisis de datos. 
              La decisión final es responsabilidad del cirujano.
            </p>
          </div>
        )}

      </main>

      <footer className="py-6 px-4 bg-slate-100 border-t border-slate-200">
        <p className="text-xs text-center text-slate-500 max-w-md mx-auto leading-relaxed">
          Esta predicción se basa en un modelo de redes neuronales, entrenada con datos de población latinoamericana. 
          Logra acotar a tres medidas con precisión mayor al 92%.
        </p>
      </footer>
    </div>
  );
};

export default App;