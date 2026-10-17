import lotecitoShot from '../assets/projects/lotecito.png';
import focuslyShot from '../assets/projects/focusly.png';
import photofinderShot from '../assets/projects/photofinder.webp';
import type { MaybeImg, MaybeUrl } from '../i18n/types';

// Datos compartidos entre idiomas. Un dato pendiente se marca con TODO(…) de ./placeholders
// y `npm run todo` lo lista. Capturas: guardalas en src/assets/projects/ e importalas, p.ej.:
//   import proyectoShot from '../assets/projects/proyecto.png';
//   proyecto: { image: proyectoShot, ... }
// repo y demo son opcionales: si un proyecto no tiene ninguno, no se muestra el bloque de links.
interface ProjectLinks {
  image: MaybeImg;
  repo?: MaybeUrl;
  demo?: MaybeUrl;
}

export const links: {
  lotecito: ProjectLinks;
  focusly: ProjectLinks;
  photofinder: ProjectLinks;
  contact: Record<'mail' | 'github' | 'linkedin', MaybeUrl>;
} = {
  // Repo privado: el sistema corre en producción con datos reales.
  lotecito: { image: lotecitoShot },
  focusly: {
    image: focuslyShot,
    repo: 'https://github.com/ValentinLanus/Focusly',
  },
  photofinder: {
    image: photofinderShot,
    repo: 'https://github.com/ValentinLanus/PhotoFinder',
  },
  contact: {
    mail: 'mailto:vlanus697@gmail.com',
    github: 'https://github.com/ValentinLanus',
    linkedin: 'https://www.linkedin.com/in/valentin-lanus-069196214/',
  },
};
