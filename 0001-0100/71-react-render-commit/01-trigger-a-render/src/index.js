import Image from './Image.js';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'))
root.render(
  <div>
    <Image />
    <Image />
  </div>
);
