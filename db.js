/**
 * db.js — Almacenamiento local para DEMO Vertiv Mexicali
 * Gestiona asignaciones, activos y colaboradores vía localStorage.
 */

const DB_KEY_ASIGNACIONES = 'VERTIV_ASIGNACIONES_V1';
const DB_KEY_COLABORADORES = 'VERTIV_COLABORADORES_V1';

// Datos predeterminados de prueba para Vertiv Mexicali
const DATOS_INICIALES_COLABORADORES = [
  { id: 'V-1042', nombre: 'Carlos Mendoza Ruiz', depto: 'Ingeniería de Planta / UPS', puesto: 'Técnico de Campo' },
  { id: 'V-1088', nombre: 'Mariana López Castro', depto: 'Calidad y Pruebas', puesto: 'Inspectora QA' },
  { id: 'V-2015', nombre: 'Alejandro Valenzuela', depto: 'Mantenimiento e Instalaciones', puesto: 'Especialista Eléctrico' }
];

const DATOS_INICIALES_ASIGNACIONES = [
  {
    folio: 'RESP-2026-001',
    empleadoId: 'V-1042',
    empleadoNombre: 'Carlos Mendoza Ruiz',
    depto: 'Ingeniería de Planta / UPS',
    fechaEntrega: '2026-10-15',
    estado: 'ACTIVO',
    equipos: [
      { codigo: 'VERTIV-LAP-042', categoria: 'Laptop', descripcion: 'Dell Latitude 5430 Core i7', serie: '8FG9X23', devuelto: false, foto: null },
      { codigo: 'VERTIV-CHG-042', categoria: 'Cargador', descripcion: 'Cargador Dell USB-C 65W Original', serie: 'CN-0G6J41', devuelto: false, foto: null },
      { codigo: 'VERTIV-RAD-015', categoria: 'Radio Comunicación', descripcion: 'Radio Motorola DGP8550e con clip', serie: '782TXA091', devuelto: false, foto: null },
      { codigo: 'VERTIV-FLK-108', categoria: 'Equipo de Medición', descripcion: 'Multímetro Industrial Fluke 87V', serie: 'FK-9871234', devuelto: false, foto: null }
    ],
    fotoEntrega: null,
    firmaEntrega: null,
    fechaDevolucion: null,
    fotoDevolucion: null,
    firmaDevolucion: null,
    comentariosDevolucion: ''
  }
];

function consolidarAsignacionesDuplicadas() {
  try {
    const raw = localStorage.getItem(DB_KEY_ASIGNACIONES);
    if (!raw) return;
    const asignaciones = JSON.parse(raw);
    const mapa = new Map();
    const limpias = [];

    for (const asig of asignaciones) {
      const empId = asig.empleadoId ? asig.empleadoId.trim().toUpperCase() : null;
      const esAbierta = asig.estado === 'ACTIVO' || asig.estado === 'DEVUELTO_PARCIAL';

      if (empId && esAbierta) {
        if (mapa.has(empId)) {
          // Fusionar activos en la responsiva principal del colaborador
          const principal = mapa.get(empId);
          asig.equipos.forEach(eq => {
            if (!principal.equipos.some(e => e.codigo.trim().toUpperCase() === eq.codigo.trim().toUpperCase())) {
              principal.equipos.push(eq);
            }
          });
          principal.estado = 'ACTIVO';
        } else {
          mapa.set(empId, asig);
          limpias.push(asig);
        }
      } else {
        limpias.push(asig);
      }
    }
    localStorage.setItem(DB_KEY_ASIGNACIONES, JSON.stringify(limpias));
  } catch (e) {
    console.warn('Error al consolidar asignaciones:', e);
  }
}

function inicializarDB() {
  if (!localStorage.getItem(DB_KEY_COLABORADORES)) {
    localStorage.setItem(DB_KEY_COLABORADORES, JSON.stringify(DATOS_INICIALES_COLABORADORES));
  }
  if (!localStorage.getItem(DB_KEY_ASIGNACIONES)) {
    localStorage.setItem(DB_KEY_ASIGNACIONES, JSON.stringify(DATOS_INICIALES_ASIGNACIONES));
  } else {
    consolidarAsignacionesDuplicadas();
  }
}

function obtenerColaboradores() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(DB_KEY_COLABORADORES) || '[]');
}

function guardarColaborador(colaborador) {
  const lista = obtenerColaboradores();
  const index = lista.findIndex(c => c.id.toUpperCase() === colaborador.id.toUpperCase());
  if (index >= 0) {
    lista[index] = { ...lista[index], ...colaborador };
  } else {
    lista.push(colaborador);
  }
  localStorage.setItem(DB_KEY_COLABORADORES, JSON.stringify(lista));
  return colaborador;
}

function obtenerAsignaciones() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(DB_KEY_ASIGNACIONES) || '[]');
}

function guardarNuevaAsignacion(asignacion) {
  const asignaciones = obtenerAsignaciones();
  const idNormalizado = asignacion.empleadoId.trim().toUpperCase();

  // Buscar si el colaborador ya tiene una responsiva abierta (ACTIVO o DEVUELTO_PARCIAL)
  const existenteIndex = asignaciones.findIndex(a => 
    a.empleadoId.trim().toUpperCase() === idNormalizado &&
    (a.estado === 'ACTIVO' || a.estado === 'DEVUELTO_PARCIAL')
  );

  if (existenteIndex !== -1) {
    // ANEXAR a su responsiva existente para consolidar todos sus activos en una sola cuenta
    const existente = asignaciones[existenteIndex];
    
    asignacion.equipos.forEach(nuevoEq => {
      const yaExiste = existente.equipos.some(e => e.codigo.trim().toUpperCase() === nuevoEq.codigo.trim().toUpperCase());
      if (!yaExiste) {
        existente.equipos.push(nuevoEq);
      }
    });

    existente.estado = 'ACTIVO'; // Vuelve a estado activo con los nuevos equipos pendientes
    existente.ultimaFechaEntrega = asignacion.fechaEntrega || new Date().toISOString();
    if (asignacion.firmaEntrega) existente.firmaEntrega = asignacion.firmaEntrega;
    if (asignacion.fotoEntrega) existente.fotoEntrega = asignacion.fotoEntrega;
    if (asignacion.depto) existente.depto = asignacion.depto;

    asignaciones[existenteIndex] = existente;
    localStorage.setItem(DB_KEY_ASIGNACIONES, JSON.stringify(asignaciones));
    return { ...existente, esAnexo: true };
  }

  // Si es nuevo colaborador sin responsiva abierta, crear nueva con folio correlativo
  if (!asignacion.folio) {
    const num = asignaciones.length + 1;
    asignacion.folio = `RESP-2026-${String(num).padStart(3, '0')}`;
  }
  asignacion.estado = 'ACTIVO';
  asignaciones.unshift(asignacion);
  localStorage.setItem(DB_KEY_ASIGNACIONES, JSON.stringify(asignaciones));
  return { ...asignacion, esAnexo: false };
}

function obtenerAsignacionActivaPorEmpleado(empleadoId) {
  const asignaciones = obtenerAsignaciones();
  return asignaciones.find(a => 
    a.empleadoId.trim().toUpperCase() === empleadoId.trim().toUpperCase() && 
    (a.estado === 'ACTIVO' || a.estado === 'DEVUELTO_PARCIAL')
  );
}

function registrarDevolucion(folio, equiposDevueltos, firmaDevolucion, comentarios, fotoDevolucion) {
  const asignaciones = obtenerAsignaciones();
  const index = asignaciones.findIndex(a => a.folio === folio);
  if (index === -1) return false;

  const asignacion = asignaciones[index];
  asignacion.equipos = equiposDevueltos;
  asignacion.fechaDevolucion = new Date().toISOString();
  asignacion.firmaDevolucion = firmaDevolucion;
  asignacion.comentariosDevolucion = comentarios || '';
  if (fotoDevolucion) asignacion.fotoDevolucion = fotoDevolucion;

  const todosDevueltos = asignacion.equipos.every(e => e.devuelto === true);
  asignacion.estado = todosDevueltos ? 'DEVUELTO_TOTAL' : 'DEVUELTO_PARCIAL';

  asignaciones[index] = asignacion;
  localStorage.setItem(DB_KEY_ASIGNACIONES, JSON.stringify(asignaciones));
  return asignacion;
}

// Búsqueda global para el Localizador de Activos
function buscarActivoGlobal(codigo) {
  if (!codigo) return null;
  const asignaciones = obtenerAsignaciones();
  const cleanCode = codigo.trim().toUpperCase();

  for (const asig of asignaciones) {
    const equipo = asig.equipos.find(e => 
      (e.codigo && e.codigo.trim().toUpperCase() === cleanCode) ||
      (e.serie && e.serie.trim().toUpperCase() === cleanCode)
    );
    if (equipo) {
      return {
        equipo,
        asignacion: {
          folio: asig.folio,
          empleadoId: asig.empleadoId,
          empleadoNombre: asig.empleadoNombre,
          depto: asig.depto,
          fechaEntrega: asig.fechaEntrega,
          fechaDevolucion: asig.fechaDevolucion,
          estado: asig.estado
        }
      };
    }
  }
  return null;
}

inicializarDB();

// Gestión de sesión corporativa para DEMO
function obtenerUsuarioSesion() {
  try {
    const raw = localStorage.getItem('VERTIV_USER');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function cerrarSesion() {
  localStorage.removeItem('VERTIV_USER');
  window.location.href = 'login.html';
}

function esSupervisor() {
  const u = obtenerUsuarioSesion();
  return Boolean(u && (u.rol.includes('Supervisor') || u.rol.includes('Almacén') || u.rol.includes('Consulta')));
}

function inicializarBarraUsuario() {
  const user = obtenerUsuarioSesion();
  if (!user) {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
      return;
    }
  }
  const box = document.getElementById('userNavBox');
  if (box && user) {
    const nameEl = document.getElementById('userNavName');
    const roleEl = document.getElementById('userNavRole');
    if (nameEl) nameEl.textContent = user.nombre;
    if (roleEl) {
      if (esSupervisor()) {
        roleEl.textContent = 'Supervisor (Solo Consulta)';
        roleEl.style.color = '#38bdf8';
      } else {
        roleEl.textContent = 'Administrador TI (Total)';
        roleEl.style.color = '#4ade80';
      }
    }
    box.style.display = 'flex';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  inicializarBarraUsuario();
});
