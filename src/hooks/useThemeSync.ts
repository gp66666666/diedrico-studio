import { useEffect } from 'react';
import { useGeometryStore } from '../store/geometryStore';

/**
 * Hook que sincroniza el tema entre el store y el DOM
 * Asegura que las clases CSS del documento siempre coincidan con el estado del tema
 */
export const useThemeSync = () => {
  const theme = useGeometryStore((state) => state.theme);

  useEffect(() => {
    // Asegurar que las clases CSS siempre estén sincronizadas con el tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Guardar tema en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
};

/**
 * Hook para inicializar el tema al cargar la aplicación
 */
export const useThemeInitializer = () => {
  useEffect(() => {
    // Siempre iniciar con tema oscuro por defecto
    const defaultTheme = 'dark';
    
    // Obtener tema guardado si existe
    const savedTheme = localStorage.getItem('theme');
    
    // Usar tema guardado si es válido, sino usar el tema oscuro por defecto
    const themeToUse = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : defaultTheme;
    
    // Actualizar el store con el tema correcto
    useGeometryStore.setState({ theme: themeToUse });
    
    // Aplicar clases CSS iniciales
    if (themeToUse === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Guardar en localStorage para futuros usos
    localStorage.setItem('theme', themeToUse);
  }, []);
};