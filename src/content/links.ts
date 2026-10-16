import { TODO } from './placeholders';
import lotecitoShot from '../assets/projects/lotecito.png';
import focuslyShot from '../assets/projects/focusly.png';
import photofinderShot from '../assets/projects/photofinder.webp';
import type { MaybeImg, MaybeUrl } from '../i18n/types';

// Datos compartidos entre idiomas. Reemplazá cada TODO(...) por el valor real.
// Capturas: guardalas en src/assets/projects/ e importalas, p.ej.:
//   import proyectoShot from '../assets/projects/proyecto.png';
//   proyecto: { image: proyectoShot, ... }
interface ProjectLinks {
  image: MaybeImg;
  repo: MaybeUrl;
  demo: MaybeUrl;
}

export const links: {
  lotecito: ProjectLinks;
  focusly: ProjectLinks;
  photofinder: ProjectLinks;
  contact: Record<'mail' | 'whatsapp' | 'github' | 'linkedin', MaybeUrl>;
} = {
  lotecito: {
    image: lotecitoShot,
    repo: TODO('Repo Lotecito'),
    demo: TODO('Demo Lotecito'),
  },
  focusly: {
    image: focuslyShot,
    repo: 'https://github.com/ValentinLanus/Focusly',
    demo: TODO('Demo Focusly'),
  },
  photofinder: {
    image: photofinderShot,
    repo: 'https://github.com/ValentinLanus/PhotoFinder',
    demo: TODO('Demo PhotoFinder'),
  },
  contact: {
    mail: TODO('Mail (mailto:...)'),
    whatsapp: TODO('WhatsApp (https://wa.me/...)'),
    github: 'https://github.com/ValentinLanus',
    linkedin: TODO('LinkedIn (https://linkedin.com/in/...)'),
  },
};
