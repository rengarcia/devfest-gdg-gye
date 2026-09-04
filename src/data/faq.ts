export interface FaqItem {
  q: string;
  a: string;
  /** anchor id, e.g. the code of conduct is linked from the footer as /faq#conducta */
  id?: string;
}

export const faq: FaqItem[] = [
  { q: '¿Cuánto cuesta la entrada?', a: 'Nada. DevFest Guayaquil es gratuito gracias a los sponsors. Solo necesitas registrarte con anticipación porque el cupo es de 500 personas.' },
  { q: '¿Necesito ser developer para asistir?', a: 'No. Vienen estudiantes, diseñadores, product managers y gente curiosa. Las charlas de nivel introductorio están marcadas en la agenda.' },
  { q: '¿Cómo llego a ESPOL?', a: 'El Campus Gustavo Galindo está en el km 30.5 de la Vía Perimetral. Hay estacionamiento gratuito y la parada de Metrovía “ESPOL” queda a 5 minutos caminando. Publicaremos un mapa con las salas una semana antes.' },
  { q: '¿Habrá comida?', a: 'Sí. Café y snacks en la acreditación, almuerzo incluido y una pausa a media tarde. Indica restricciones alimentarias en el registro.' },
  { q: '¿Puedo cambiar de track durante el día?', a: 'Sí. Cada bloque tiene 15 minutos de margen para moverte entre salas. Las sesiones no requieren inscripción separada, excepto los workshops de 90 minutos, que tienen cupo de 40 personas.' },
  { q: '¿Las charlas se graban?', a: 'Grabamos las keynotes y las charlas del Auditorio A. Se publican en el canal de GDG Guayaquil en las semanas siguientes al evento.' },
  { q: '¿Cómo propongo una charla?', a: 'A través del formulario de Call for papers en la página de speakers, hasta el 15 de octubre. Evaluamos relevancia local, claridad de la propuesta y diversidad de voces. Si es tu primera charla, te asignamos un mentor del equipo.' },
  { q: '¿Tienen código de conducta?', a: 'Sí, y aplica para todos: asistentes, speakers, sponsors y organizadores. Buscamos un espacio libre de acoso en cualquier forma. Si ves o vives algo que no está bien, habla con cualquier persona del staff (camiseta amarilla) o escribe a conducta@gdgguayaquil.dev.', id: 'conducta' },
  { q: '¿El campus es accesible?', a: 'Los auditorios A y B y el bloque 15 tienen acceso por rampa y baños accesibles. Si necesitas intérprete de lengua de señas, asiento reservado u otro apoyo, indícalo en el registro y coordinamos contigo.' },
];
