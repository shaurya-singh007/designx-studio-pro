import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import {
  MousePointer2, Square, Circle, Triangle, Type, Image as ImgIcon,
  Minus, Pen, Eraser, Hand, ZoomIn, ZoomOut, Undo, Redo,
  Download, Share2, Layers, SlidersHorizontal, Sparkles,
  Trash2, Copy, Bold, Italic, AlignCenter, Palette,
  ChevronLeft, ChevronDown, Plus, Eye, EyeOff, Lock, RotateCcw, Grid
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportCanvas, saveDesignJSON, loadDesignJSON, addImageToCanvas } from '../utils/exportCanvas';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


const COLORS = ['#8B5CF6','#EC4899','#06B6D4','#F59E0B','#10B981','#EF4444','#F97316','#FFFFFF','#000000','#6B7280'];
const TOOL_SECTIONS = [
  { tools: [{ id:'select', Icon: MousePointer2 }, { id:'hand', Icon: Hand }] },
  { tools: [{ id:'rect', Icon: Square }, { id:'circle', Icon: Circle }, { id:'triangle', Icon: Triangle }, { id:'line', Icon: Minus }] },
  { tools: [{ id:'pen', Icon: Pen }, { id:'eraser', Icon: Eraser }] },
  { tools: [{ id:'text', Icon: Type }, { id:'image', Icon: ImgIcon }] },
];

export default function CanvasEditor() {
  const navigate = useNavigate();
  const { addNotif, activeDesign } = useStore();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const importRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [panel, setPanel] = useState(null);
  const [fill, setFill] = useState('#8B5CF6');
  const [stroke, setStroke] = useState('#FFFFFF');
  const [strokeW, setStrokeW] = useState(2);
  const [fontSize, setFontSize] = useState(28);
  const [canvasName, setCanvasName] = useState(activeDesign?.name || 'Untitled Design');
  const [showExport, setShowExport] = useState(false);
  const [layers, setLayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(false);


  // ── Init Fabric ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 320, height: 420,
      backgroundColor: '#13121F',
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;
    window.__fabricCanvas = canvas;

    // Load saved design
    if (activeDesign?.canvas) {
      canvas.loadFromJSON(activeDesign.canvas, () => canvas.renderAll());
    }

    // History
    const saveHistory = () => {
      const json = JSON.stringify(canvas.toJSON());
      setHistory(h => [...h.slice(0, histIdx + 1), json].slice(-30));
      setHistIdx(i => Math.min(i + 1, 29));
    };
    canvas.on('object:added', () => { syncLayers(canvas); saveHistory(); });
    canvas.on('object:modified', () => { syncLayers(canvas); saveHistory(); });
    canvas.on('object:removed', () => { syncLayers(canvas); saveHistory(); });

    return () => canvas.dispose();
  }, []);

  const syncLayers = (canvas) => {
    const objs = canvas.getObjects();
    setLayers(objs.map((o, i) => ({
      id: i, name: o.type === 'i-text' ? `Text: ${o.text?.slice(0,12)}` : o.type,
      visible: o.visible !== false, locked: o.lockMovementX || false,
    })));
  };

  // ── Tool logic ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.selection = true;

    if (tool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeW;
      canvas.freeDrawingBrush.color = fill;
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 20;
      canvas.freeDrawingBrush.color = canvas.backgroundColor;
    } else if (tool === 'hand') {
      canvas.selection = false;
    }
  }, [tool, fill, strokeW]);

  const addShape = useCallback((type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let obj;
    const common = { fill, stroke, strokeWidth: strokeW, left: 60, top: 80 };
    if (type === 'rect') obj = new fabric.Rect({ ...common, width: 120, height: 80, rx: 8 });
    else if (type === 'circle') obj = new fabric.Circle({ ...common, radius: 50 });
    else if (type === 'triangle') obj = new fabric.Triangle({ ...common, width: 100, height: 90 });
    else if (type === 'line') obj = new fabric.Line([0,0,150,0], { stroke: fill, strokeWidth: strokeW, left: 60, top: 120 });
    if (obj) { canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll(); }
  }, [fill, stroke, strokeW]);

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Click to edit', {
      left: 60, top: 100, fontSize, fill,
      fontFamily: 'Plus Jakarta Sans', fontWeight: '700',
    });
    canvas.add(text); canvas.setActiveObject(text); text.enterEditing(); canvas.renderAll();
  };

  const handleToolClick = (id) => {
    setTool(id);
    if (['rect','circle','triangle','line'].includes(id)) addShape(id);
    else if (id === 'text') addText();
    else if (id === 'image') fileInputRef.current?.click();
  };

  // ── Image upload ───────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    try {
      await addImageToCanvas(fabricRef.current, file);
      addNotif('Image added to canvas', 'success');
    } catch { addNotif('Failed to add image', 'error'); }
    e.target.value = '';
  };

  // ── Import JSON ────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const text = await file.text();
    try {
      const name = await loadDesignJSON(fabricRef.current, text);
      setCanvasName(name);
      addNotif('Design imported!', 'success');
    } catch { addNotif('Invalid design file', 'error'); }
    e.target.value = '';
  };

  // ── Undo / Redo ────────────────────────────────────────────────
  const undo = () => {
    if (histIdx <= 0) return;
    const idx = histIdx - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[idx]), () => fabricRef.current.renderAll());
    setHistIdx(idx);
  };
  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const idx = histIdx + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[idx]), () => fabricRef.current.renderAll());
    setHistIdx(idx);
  };

  // ── Delete selected ────────────────────────────────────────────
  const deleteSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  };

  // ── Duplicate ─────────────────────────────────────────────────
  const duplicate = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.clone((clone) => {
      clone.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(clone); canvas.setActiveObject(clone); canvas.renderAll();
    });
  };

  // ── Zoom ──────────────────────────────────────────────────────
  const changeZoom = (delta) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = Math.min(Math.max(zoom + delta, 25), 300);
    canvas.setZoom(z / 100);
    canvas.setWidth(320 * (z / 100));
    canvas.setHeight(420 * (z / 100));
    setZoom(z);
  };

  const doExport = async (format) => {
    try {
      await exportCanvas(fabricRef.current, format, canvasName, false);
      addNotif(`Exported as ${format.toUpperCase()}!`, 'success');
      setShowExport(false);
    } catch (e) { addNotif('Export failed', 'error'); }
  };

  // ── Save to Cloud ──────────────────────────────────────────────
  const saveToCloud = async () => {
    if (!fabricRef.current) return;
    setSaving(true);
    try {
      const canvasData = fabricRef.current.toJSON();
      const payload = { name: canvasName, canvasData, type: 'Canvas' };
      const token = useStore.getState().token;
      
      if (activeDesign?.id) {
        await axios.put(`${API}/designs/${activeDesign.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const { data } = await axios.post(`${API}/designs`, payload, { headers: { Authorization: `Bearer ${token}` } });
        useStore.getState().setActiveDesign(data);
      }
      addNotif('Design saved to cloud! ☁️', 'success');
    } catch (e) {
      addNotif('Cloud save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Apply color to selected ────────────────────────────────────

  const applyFill = (c) => {
    setFill(c);
    const obj = fabricRef.current?.getActiveObject();
    if (obj) { obj.set('fill', c); fabricRef.current.renderAll(); }
  };

  // ── Apply Filter ──────────────────────────────────────────────
  const applyFilter = (filterType) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== 'image') {
      addNotif('Select an image to apply filters', 'warning');
      return;
    }
    
    let filter;
    switch(filterType) {
      case 'grayscale': filter = new fabric.Image.filters.Grayscale(); break;
      case 'sepia': filter = new fabric.Image.filters.Sepia(); break;
      case 'invert': filter = new fabric.Image.filters.Invert(); break;
      case 'blur': filter = new fabric.Image.filters.Blur({ blur: 0.5 }); break;
      default: obj.filters = []; obj.applyFilters(); fabricRef.current.renderAll(); return;
    }
    
    obj.filters = [filter];
    obj.applyFilters();
    fabricRef.current.renderAll();
    addNotif(`Applied ${filterType} filter`, 'success');
  };


  // ── Layer visibility ──────────────────────────────────────────
  const toggleLayerVisible = (idx) => {
    const objs = fabricRef.current?.getObjects();
    if (!objs?.[idx]) return;
    objs[idx].visible = !objs[idx].visible;
    fabricRef.current.renderAll();
    syncLayers(fabricRef.current);
  };

  return (
    <div className="canvas-page" style={{ background: 'var(--bg-base)' }}>
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={importRef} type="file" accept=".json,.designx.json" className="hidden" onChange={handleImport} />

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-2 h-12 flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-xs font-600" style={{ color: 'var(--color-muted)' }}>
          <ChevronLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-1 flex-1 justify-center">
          <span className="text-xs font-700 truncate max-w-[120px]" style={{ color: 'var(--color-text)' }}>{canvasName}</span>
          <ChevronDown size={11} style={{ color: 'var(--color-muted)' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => importRef.current?.click()}
            className="tool-btn w-8 h-8 text-xs font-600" title="Import design">
            <span style={{ fontSize: 10 }}>↑</span>
          </button>
          <button onClick={() => saveDesignJSON(fabricRef.current, canvasName)}
            className="tool-btn w-8 h-8" title="Save JSON">
            <span style={{ fontSize: 10 }}>💾</span>
          </button>
          <div className="relative">
            <button onClick={() => setShowExport(!showExport)}
              className="btn-gold text-[11px] py-1.5 px-3 flex items-center gap-1" style={{ borderRadius: '8px' }}>
              <Download size={12} /> Export
            </button>
            {showExport && (
              <div className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden z-50 animate-slide-up"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--color-border)', minWidth: 130 }}>
                {[['PNG','png'],['JPG','jpeg'],['PDF','pdf'],['SVG','svg']].map(([label, fmt]) => (
                  <button key={fmt} onClick={() => doExport(fmt)}
                    className="w-full text-left px-4 py-2.5 text-xs font-600 hover:bg-[var(--color-primary-glow)] transition-colors"
                    style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={saveToCloud} disabled={saving}
            className="btn-primary text-[11px] py-1.5 px-4 flex items-center gap-1 ml-1" 
            style={{ borderRadius: '8px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <RotateCcw size={12} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>


      {/* SECONDARY TOOLBAR */}
      <div className="flex items-center gap-1.5 px-2 h-10 flex-shrink-0 overflow-x-auto"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--color-border)' }}>
        <button className="tool-btn w-8 h-8" onClick={undo} title="Undo"><Undo size={13} /></button>
        <button className="tool-btn w-8 h-8" onClick={redo} title="Redo"><Redo size={13} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />
        <button className="tool-btn w-8 h-8" onClick={duplicate}><Copy size={13} /></button>
        <button className="tool-btn w-8 h-8" onClick={deleteSelected}><Trash2 size={13} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />
        <button className="tool-btn w-8 h-8" onClick={() => changeZoom(-25)}><ZoomOut size={13} /></button>
        <span className="text-[10px] font-600 min-w-[30px] text-center" style={{ color: 'var(--color-muted)' }}>{zoom}%</span>
        <button className="tool-btn w-8 h-8" onClick={() => changeZoom(25)}><ZoomIn size={13} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />
        {/* Fill picker */}
        <label className="tool-btn w-8 h-8 relative overflow-hidden" title="Fill color">
          <div className="absolute inset-1 rounded" style={{ background: fill }} />
          <input type="color" value={fill} onChange={e => applyFill(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
        </label>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="canvas-sidebar flex-shrink-0">
          {TOOL_SECTIONS.map((sec, si) => (
            <div key={si} className="flex flex-col items-center gap-1 w-full pb-1 mb-1"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              {sec.tools.map(({ id, Icon }) => (
                <button key={id} onClick={() => handleToolClick(id)}
                  className={`tool-btn ${tool === id ? 'active' : ''}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          ))}
          {/* Active fill swatch */}
          <div className="w-8 h-8 rounded-lg border-2 mt-1 cursor-pointer"
            style={{ background: fill, borderColor: 'var(--color-border)' }} />
        </div>

        {/* CANVAS AREA */}
        <div className="flex-1 overflow-auto flex items-center justify-center relative"
          style={{ background: `repeating-linear-gradient(0deg,rgba(139,92,246,0.04) 0,rgba(139,92,246,0.04) 1px,transparent 1px,transparent 30px),repeating-linear-gradient(90deg,rgba(139,92,246,0.04) 0,rgba(139,92,246,0.04) 1px,transparent 1px,transparent 30px)` }}>
          <div className="fabric-container rounded-xl overflow-hidden"
            style={{ boxShadow: '0 0 50px rgba(0,0,0,0.7), 0 0 20px var(--color-primary-glow)' }}>
            <canvas ref={canvasRef} />
          </div>
          {/* AI btn */}
          <button onClick={() => setPanel(panel === 'ai' ? null : 'ai')}
            className="absolute top-3 right-3 text-[11px] font-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white"
            style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent1))', boxShadow: '0 0 14px var(--color-primary-glow)' }}>
            <Sparkles size={12} /> AI
          </button>
        </div>

        {/* RIGHT PANEL ICONS */}
        <div className="flex flex-col gap-1 pt-1 flex-shrink-0"
          style={{ width: '44px', background: 'var(--bg-card)', borderLeft: '1px solid var(--color-border)' }}>
          {[{ id:'layers', Icon:Layers }, { id:'props', Icon:SlidersHorizontal }, { id:'ai', Icon:Sparkles }].map(({ id, Icon }) => (
            <button key={id} onClick={() => setPanel(panel === id ? null : id)}
              className={`tool-btn mx-auto ${panel === id ? 'active' : ''}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM PANELS */}
      {panel && (
        <div className="flex-shrink-0 overflow-y-auto animate-slide-up"
          style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--color-border)', maxHeight: '240px' }}>
          <div className="flex items-center justify-between px-4 py-2 sticky top-0"
            style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-xs font-700 capitalize" style={{ color: 'var(--color-text)' }}>
              {panel === 'ai' ? '✦ AI Generator' : panel}
            </span>
            <button onClick={() => setPanel(null)} className="text-lg leading-none" style={{ color: 'var(--color-muted)' }}>×</button>
          </div>

          {panel === 'layers' && (
            <div className="px-3 py-2 space-y-1">
              {layers.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--color-muted)' }}>Canvas is empty</p>}
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center gap-2 px-2 py-2 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-[10px] w-4" style={{ color: 'var(--color-muted)' }}>
                    {layer.name.startsWith('Text') ? 'T' : '◻'}
                  </span>
                  <span className="flex-1 text-[11px] font-600 capitalize truncate" style={{ color: 'var(--color-text)' }}>{layer.name}</span>
                  <button onClick={() => toggleLayerVisible(layer.id)} style={{ color: 'var(--color-muted)' }}>
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {panel === 'props' && (
            <div className="px-3 py-3 space-y-4">
              <div>
                <label className="text-[10px] font-600 uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>Fill Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => applyFill(c)}
                      className="w-7 h-7 rounded-lg border-2 transition-all"
                      style={{ background: c, borderColor: fill === c ? '#fff' : 'transparent' }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Stroke Width</label>
                  <input type="range" min="0" max="20" value={strokeW} onChange={e => setStrokeW(+e.target.value)}
                    className="w-full mt-1" />
                  <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{strokeW}px</span>
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Font Size</label>
                  <input type="range" min="10" max="120" value={fontSize} onChange={e => setFontSize(+e.target.value)}
                    className="w-full mt-1" />
                  <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{fontSize}px</span>
                </div>
              </div>
              {/* Canvas Background */}
              <div>
                <label className="text-[10px] font-600 uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>Canvas Background</label>
                <div className="flex gap-2 flex-wrap">
                  {['#13121F','#FFFFFF','#0F172A','#FFF7ED','#EFF6FF','#F0FDF4'].map(c => (
                    <button key={c} onClick={() => { fabricRef.current.backgroundColor = c; fabricRef.current.renderAll(); }}
                      className="w-7 h-7 rounded-lg border-2"
                      style={{ background: c, borderColor: 'var(--color-border)' }} />
                  ))}
                </div>
              </div>

              {/* Image Filters */}
              <div>
                <label className="text-[10px] font-600 uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>Image Filters</label>
                <div className="flex gap-2 flex-wrap">
                  {['None','grayscale','sepia','invert','blur'].map(f => (
                    <button key={f} onClick={() => applyFilter(f)}
                      className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--color-border)] text-[9px] capitalize hover:border-[var(--color-primary)]"
                      style={{ color: 'var(--color-text)' }}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          )}


          {panel === 'ai' && (
            <div className="px-3 py-3">
              <div className="relative mb-3">
                <input type="text" placeholder="Describe what to generate..."
                  className="input-field pr-10 text-xs" />
                <Sparkles size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-accent3)' }} />
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {['Gradient BG','Abstract','Geometric','Typography'].map(s => (
                  <button key={s} className="text-[10px] px-2 py-1 rounded-full font-600"
                    style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>{s}</button>
                ))}
              </div>
              <button className="btn-primary w-full text-xs flex items-center justify-center gap-2 py-2.5">
                <Sparkles size={13} /> Generate with AI
              </button>
              <p className="text-[10px] text-center mt-2" style={{ color: 'var(--color-muted)' }}>5 credits remaining</p>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM TOOLBAR */}
      <div className="flex items-center justify-around h-12 flex-shrink-0 px-2"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--color-border)' }}>
        {[
          { Icon: Grid, label:'Canvas', action: () => {} },
          { Icon: Layers, label:'Layers', action: () => setPanel('layers') },
          { Icon: Palette, label:'Style', action: () => setPanel('props') },
          { Icon: Sparkles, label:'AI', action: () => setPanel('ai') },
          { Icon: RotateCcw, label:'Reset', action: () => { fabricRef.current?.clear(); fabricRef.current?.renderAll(); } },
        ].map(({ Icon, label, action }) => (
          <button key={label} onClick={action}
            className="flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: 'var(--color-muted)' }}>
            <Icon size={16} />
            <span className="text-[9px] font-500">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
