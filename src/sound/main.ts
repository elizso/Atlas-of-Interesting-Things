import './style.css'
import {
    generateStrudel, 
    type PatternNode
} from './pattern'; 
import {
    connections,
    toggleConnection
} from './connection';
import { createPatchEditor } from './patch-editor';

const reteContainer =
  document.querySelector<HTMLElement>('#rete-editor');

if (reteContainer) {
  createPatchEditor(reteContainer).catch(console.error);
}

const notesInput = document.querySelector<HTMLInputElement>('#notes')!;
const reverseInput = document.querySelector<HTMLInputElement>('#reverse')!;
const fastInput = document.querySelector<HTMLInputElement>('#fast')!; 
const output = document.querySelector<HTMLElement>('#output')!;

const cable = document.querySelector<HTMLButtonElement>(
    '#reverse-fast-cable'
)!; 

function updatePattern(): void {
    let pattern: PatternNode = {
        type: 'notes', 
        notes: notesInput.value
    };

    const fastConnected = connections.some(
        connection => 
            connection.from === 'reverse' && connection.to === 'fast'
    ); 

    if (fastInput.checked && fastConnected) {
        pattern = {
            type: 'fast', 
            factor: 2, 
            input: pattern
        }
    }

    if (reverseInput.checked) {
        pattern = {
            type: 'reverse', 
            input: pattern 
        }; 
    }

    output.textContent = generateStrudel(pattern); 
    console.log(output.textContent);
}

notesInput.addEventListener('input', updatePattern); 
reverseInput.addEventListener('change', updatePattern); 
fastInput.addEventListener('change', updatePattern); 

cable.addEventListener('click', () => {
  toggleConnection('reverse', 'fast');

  const connected = connections.some(
    connection =>
      connection.from === 'reverse' &&
      connection.to === 'fast'
  );

  cable.classList.toggle('disconnected', !connected);
  cable.setAttribute('aria-pressed', String(connected));

  updatePattern();
});

updatePattern(); 
