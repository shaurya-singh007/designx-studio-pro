import { jsPDF } from 'jspdf';

/**
 * Export a Fabric.js canvas to a given format.
 * @param {fabric.Canvas} fabricCanvas
 * @param {'png'|'jpeg'|'svg'|'pdf'} format
 * @param {string} filename
 * @param {boolean} hd  – 2x multiplier
 */
export async function exportCanvas(fabricCanvas, format, filename = 'design', hd = false) {
  if (!fabricCanvas) throw new Error('No canvas');

  const multiplier = hd ? 2 : 1;

  if (format === 'svg') {
    const svg = fabricCanvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadBlob(blob, `${filename}.svg`);
    return;
  }

  if (format === 'pdf') {
    const dataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier });
    const w = fabricCanvas.getWidth();
    const h = fabricCanvas.getHeight();
    const orientation = w > h ? 'l' : 'p';
    const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
    pdf.save(`${filename}.pdf`);
    return;
  }

  // PNG or JPEG
  const dataUrl = fabricCanvas.toDataURL({
    format: format === 'jpeg' ? 'jpeg' : 'png',
    quality: 0.95,
    multiplier,
  });
  downloadDataUrl(dataUrl, `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Save canvas as JSON string */
export function saveDesignJSON(fabricCanvas, name) {
  const json = JSON.stringify({ name, canvas: fabricCanvas.toJSON(), savedAt: new Date().toISOString() });
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${name || 'design'}.designx.json`);
}

/** Load a JSON file into the canvas */
export function loadDesignJSON(fabricCanvas, jsonString) {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(jsonString);
      const canvas = data.canvas || data;
      fabricCanvas.loadFromJSON(canvas, () => {
        fabricCanvas.renderAll();
        resolve(data.name || 'Loaded Design');
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Add an image file to the canvas */
export function addImageToCanvas(fabricCanvas, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const { fabric } = window;
      if (!fabric) { reject('Fabric not ready'); return; }
      fabric.Image.fromURL(e.target.result, (img) => {
        const maxW = fabricCanvas.getWidth() * 0.6;
        if (img.width > maxW) img.scaleToWidth(maxW);
        img.set({ left: 60, top: 60 });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        resolve(img);
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
