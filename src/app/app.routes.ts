import { Routes } from '@angular/router';
import { autenticacionGuard } from './nucleo/guardias/autenticacion.guard';
import { rolGuard } from './nucleo/guardias/rol.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'panel' },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./paginas/autenticacion/login').then((m) => m.Login),
    data: { title: 'Iniciar sesión' },
  },
  {
    path: 'panel',
    canActivate: [autenticacionGuard],
    loadComponent: () => import('./paginas/panel/layout-principal').then((m) => m.LayoutPrincipal),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./paginas/panel/panel-inicio').then((m) => m.PanelInicio),
        data: { title: 'Inicio' },
      },
      {
        path: 'especialidades',
        canActivate: [rolGuard('administrador', 'medico')],
        loadComponent: () => import('./paginas/especialidades/especialidades-lista').then((m) => m.EspecialidadesLista),
        data: { title: 'Especialidades' },
      },
      {
        path: 'medicamentos',
        canActivate: [rolGuard('administrador', 'medico')],
        loadComponent: () => import('./paginas/medicamentos/medicamentos-lista').then((m) => m.MedicamentosLista),
        data: { title: 'Medicamentos' },
      },
      {
        path: 'examenes',
        canActivate: [rolGuard('administrador', 'medico')],
        loadComponent: () => import('./paginas/examenes/examenes-lista').then((m) => m.ExamenesLista),
        data: { title: 'Exámenes' },
      },
      {
        path: 'pacientes',
        canActivate: [rolGuard('administrador', 'medico')],
        loadComponent: () => import('./paginas/pacientes/pacientes-lista').then((m) => m.PacientesLista),
        data: { title: 'Pacientes' },
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./paginas/pacientes/paciente-detalle').then((m) => m.PacienteDetalle),
        data: { title: 'Perfil de paciente' },
      },
      {
        path: 'medicos',
        loadComponent: () => import('./paginas/medicos/medicos-lista').then((m) => m.MedicosLista),
        data: { title: 'Médicos' },
      },
      {
        path: 'medicos/:id',
        loadComponent: () => import('./paginas/medicos/medico-detalle').then((m) => m.MedicoDetalle),
        data: { title: 'Perfil de médico' },
      },
      {
        path: 'citas',
        canActivate: [rolGuard('medico', 'paciente')],
        loadComponent: () => import('./paginas/citas/citas-lista').then((m) => m.CitasLista),
        data: { title: 'Citas' },
      },
      {
        path: 'consultas',
        canActivate: [rolGuard('medico', 'paciente')],
        loadComponent: () => import('./paginas/consultas/consultas-lista').then((m) => m.ConsultasLista),
        data: { title: 'Consultas' },
      },
      {
        path: 'consultas/nueva',
        canActivate: [rolGuard('medico')],
        loadComponent: () => import('./paginas/consultas/consulta-nueva').then((m) => m.ConsultaNueva),
        data: { title: 'Registrar consulta' },
      },
      {
        path: 'consultas/:id',
        canActivate: [rolGuard('medico', 'paciente')],
        loadComponent: () => import('./paginas/consultas/consulta-detalle').then((m) => m.ConsultaDetalle),
        data: { title: 'Consulta médica' },
      },
    ],
  },
  { path: '**', redirectTo: 'panel' },
];
