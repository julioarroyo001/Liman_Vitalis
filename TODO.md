# TODO: Implementar Cambios en LayersPanel y Map

## Pasos a Completar

- [x] Modificar LayersPanel.tsx:
  - [x] Mover panel al lado izquierdo (cambiar absolute right-0 a left-0)
  - [x] Agregar botón "Capas" en la parte superior para mostrar/ocultar lista de capas
  - [x] Agregar toggles para cada capa para activar/desactivar, actualizando is_active en la base de datos
  - [x] Mantener funcionalidad de crear, editar, eliminar capas intacta

- [x] Modificar Map.tsx:
  - [x] Remover el pequeño panel de capas y su botón de toggle
  - [x] Remover estado showLayerPanel y UI relacionada
  - [x] Renderizar WeatherLayer condicionalmente solo si hay una capa activa de tipo 'temperature'
  - [x] Mantener función toggleLayer para actualizar is_active en la base de datos

- [ ] Pruebas de Seguimiento:
  - [ ] Probar toggles de capas desde LayersPanel
  - [ ] Probar renderizado de WeatherLayer cuando capa de temperatura está activa
  - [ ] Probar que crear/editar/eliminar capas aún funcione
