# Instrucciones para añadir Delete y Rename

## Paso 1: Edita `src/store/geometryStore.ts`

### A) Añadir a la interfaz (línea 75, justo antes del cierre `}` de la interfaz):

```typescript
    deleteProject: (projectId: string) => Promise<void>;
    renameProject: (projectId: string, title: string, description?: string) => Promise<void>;
```

### B) Añadir al final del archivo (línea 321, justo ANTES de`}));`):

```typescript
    deleteProject: async (projectId: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    },

    renameProject: async (projectId: string, title: string, description?: string) => {
        const { error } = await supabase
            .from('projects')
            .update({ title, description: description || '' })
            .eq('id', projectId);

        if (error) throw error;
    },
```

Listo! Con eso funcionará el backend. Ahora paso 2...
