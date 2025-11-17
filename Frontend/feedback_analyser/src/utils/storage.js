// LocalStorage utilities for saving and retrieving reports
const STORAGE_KEY = 'feedback_analyses';

export const saveAnalysis = (analysis) => {
  const analyses = getAnalyses();
  const newAnalysis = {
    ...analysis,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  analyses.unshift(newAnalysis); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  return newAnalysis;
};

export const getAnalyses = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteAnalysis = (id) => {
  const analyses = getAnalyses();
  const filtered = analyses.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllAnalyses = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getSettings = () => {
  const stored = localStorage.getItem('feedback_settings');
  return stored ? JSON.parse(stored) : {
    apiUrl: 'http://localhost:5500',
    exportFormat: 'json',
    autoSave: true,
  };
};

export const saveSettings = (settings) => {
  localStorage.setItem('feedback_settings', JSON.stringify(settings));
};

