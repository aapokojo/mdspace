// Fabric.js utilities
// fabric is loaded dynamically on the client and attached to window.fabric
// All functions in this module assume they run in a browser environment

declare global {
  interface Window {
    fabric: {
      Canvas: new (el: string | HTMLElement, options?: any) => any;
      Rect: new (options?: any) => any;
      Textbox: new (text: string, options?: any) => any;
      Text: new (text: string, options?: any) => any;
      IText: new (text: string, options?: any) => any;
      [key: string]: any;
    };
  }
}

// Guard to ensure we're in a browser
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Get fabric from window, with fallback
function getFabric(): any {
  if (!isBrowser()) return null;
  return (window as any).fabric;
}

// Simple BoxObject wrapper
export function createBoxObject(options: any): any {
  const fabric = getFabric();
  
  if (!fabric || !fabric.Rect) {
    // Fallback object
    return {
      type: 'box',
      boxId: options.boxId || '',
      isPortal: options.isPortal || false,
      left: options.left || 0,
      top: options.top || 0,
      width: options.width || 160,
      height: options.height || 80,
      fill: options.fill || '#fff',
      stroke: options.stroke || '#ddd',
      strokeWidth: options.strokeWidth || 1,
      textObject: null,
      
      set: function(opts: any) {
        for (const key in opts) {
          (this as any)[key] = opts[key];
        }
      },
      
      getCenterPoint: function() {
        return { x: this.left + this.width / 2, y: this.top + this.height / 2 };
      },
      
      addTextLabel: function(content: string, canvas: any) {
        // Without fabric, we can't create text labels
      },
      
      updateText: function(content: string) {
        // Without fabric, can't update
      },
      
      enterHover: function() {
        this.stroke = '#ccc';
        this.strokeWidth = 2;
      },
      
      leaveHover: function() {
        this.stroke = '#ddd';
        this.strokeWidth = 1;
      },
      
      on: function(eventName: string, handler: any) {
        // Store handlers
        if (!this._handlers) this._handlers = {};
        if (!this._handlers[eventName]) this._handlers[eventName] = [];
        this._handlers[eventName].push(handler);
      }
    };
  }

  // Create actual fabric Rect - box background
  const rect = new fabric.Rect({
    left: options.left || 0,
    top: options.top || 0,
    width: options.width || 160,
    height: options.height || 80,
    fill: options.fill || '#fff',
    stroke: options.stroke || '#ddd',
    strokeWidth: options.strokeWidth || 1,
    rx: 0,
    ry: 0,
    selectable: true,
    hasControls: false,
    hasBorders: true,
    lockRotation: true,
    padding: 0,
    originX: 'left',
    originY: 'top',
  });

  // Add custom properties
  rect.type = 'box';
  rect.boxId = options.boxId || '';
  rect.isPortal = options.isPortal || false;
  rect.textObject = null;
  rect.content = options.content || '';

  // Add custom methods
  rect.addTextLabel = function(content: string, canvas: any, onTextChanged?: (newContent: string) => void) {
    if (this.textObject) {
      this.textObject.set({ text: content });
      canvas.renderAll();
      return;
    }

    // Create IText for editable text
    const text = new fabric.IText(content, {
      fontSize: 12,
      fill: '#222222',
      fontFamily: 'Raleway, sans-serif',
      lineHeight: 1.5,
      width: this.width - 20,
      left: this.left + 10,
      top: this.top + 10,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: true,
      editingBorderColor: '#667eea',
      padding: 5,
      borderColor: '#ddd',
      hasControls: false,
      hasBorders: false,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
    });

    // Store reference to box
    text.boxId = this.boxId;
    text.isBoxText = true;

    // When text is edited
    text.on('changed', () => {
      onTextChanged?.(text.get('text'));
    });

    // When text editing starts
    text.on('editing:entered', () => {
      // Select the box for styling
      this.set({ stroke: '#ccc', strokeWidth: 2 });
      canvas.renderAll();
    });

    // When text editing exits
    text.on('editing:exited', () => {
      this.set({ stroke: '#ddd', strokeWidth: 1 });
      canvas.renderAll();
    });

    // When text is selected (clicked)
    text.on('selected', () => {
      // Forward selection to box
      this.fire('selected');
    });

    // When box is selected, also select text
    const boxSelf = this;
    const originalOn = this.on;
    this.on = function(eventName: string, handler: any) {
      if (eventName === 'selected') {
        const wrappedHandler = function(...args: any[]) {
          handler(...args);
          // Select the text object when box is selected
          if (boxSelf.textObject) {
            canvas.setActiveObject(boxSelf.textObject);
          }
        };
        return originalOn.call(boxSelf, 'selected', wrappedHandler);
      }
      return originalOn.call(boxSelf, eventName, handler);
    };

    this.textObject = text;
    canvas.add(text);
    
    // Bring text to front but keep it associated with box
    text.bringToFront();
    
    // When box moves, move text with it
    const updateTextPosition = () => {
      if (this.textObject) {
        this.textObject.set({
          left: this.left + 10,
          top: this.top + 10,
          width: this.width - 20
        });
      }
    };
    
    this.on('moving', updateTextPosition);
    this.on('scaling', updateTextPosition);
    this.on('modified', updateTextPosition);
  };

  rect.updateText = function(content: string) {
    if (this.textObject) {
      this.textObject.set({ text: content });
    }
  };

  rect.updateSize = function(width: number, height: number) {
    this.set({ width, height });
    if (this.textObject) {
      this.textObject.set({ width: width - 20 });
    }
  };

  rect.enterHover = function() {
    this.set({ stroke: '#ccc', strokeWidth: 2 });
  };

  rect.leaveHover = function() {
    this.set({ stroke: '#ddd', strokeWidth: 1 });
  };

  return rect;
}

export type BoxObject = ReturnType<typeof createBoxObject>;

// Create a new fabric canvas for a canvas element
export function createCanvas(canvasElement: HTMLCanvasElement | string, state?: any): any {
  const fabric = getFabric();
  if (!fabric) {
    console.warn('Fabric.js not loaded, returning null canvas');
    return null;
  }
  
  // Create the fabric canvas - pass the canvas element or its ID
  const canvas = new fabric.Canvas(canvasElement, {
    selection: true,
    preserveObjectStacking: true,
    allowTouchScrolling: true,
    fireRightClick: true,
    stopContextMenu: true,
    backgroundColor: 'transparent',
    selectionColor: 'rgba(102, 126, 234, 0.2)',
    selectionBorderColor: '#667eea',
    selectionLineWidth: 2,
  });

  // Restore state if provided
  if (state) {
    canvas.setZoom(state.zoom);
    canvas.setViewportTransform([state.zoom, 0, 0, state.zoom, state.panX, state.panY]);
  }

  // Enable infinite canvas behavior
  canvas.on('mouse:wheel', (opt: any) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.1) zoom = 0.1;

    const pointer = canvas.getPointer(opt.e);
    canvas.zoomToPoint(pointer, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Panning with right mouse button or space+drag
  let isPanning = false;
  let lastPosX = 0;
  let lastPosY = 0;

  canvas.on('mouse:down', (opt: any) => {
    const evt = opt.e;
    // Check if we clicked on a box text (don't pan)
    const target = opt.target;
    if (target && target.isBoxText) {
      // If clicking on text that's already being edited, don't do anything special
      return;
    }
    
    if (evt.button === 2) { // Right mouse button
      isPanning = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      canvas.setCursor('grab');
    }
  });

  canvas.on('mouse:move', (opt: any) => {
    if (isPanning && opt.e) {
      const vpt = canvas.viewportTransform;
      if (!vpt) return;

      const deltaX = opt.e.clientX - lastPosX;
      const deltaY = opt.e.clientY - lastPosY;

      vpt[4] += deltaX;
      vpt[5] += deltaY;

      canvas.setViewportTransform(vpt);
      canvas.renderAll();

      lastPosX = opt.e.clientX;
      lastPosY = opt.e.clientY;
    }
  });

  canvas.on('mouse:up', () => {
    isPanning = false;
    canvas.setCursor('default');
  });

  // Prevent context menu
  canvas.on('mouse:contextmenu', (opt: any) => {
    opt.e.preventDefault();
  });

  // Double click on canvas to add a new box
  canvas.on('mouse:dblclick', (opt: any) => {
    if (opt.target && (opt.target.type === 'box' || opt.target.isBoxText)) {
      // Double click on box - let the component handle it
      return;
    }
    // Double click on empty canvas - could trigger box creation
  });

  return canvas;
}

// Add a box to the canvas
export function addBoxToCanvas(
  canvas: any,
  box: any,
  onSelect?: (boxId: string) => void,
  onDoubleClick?: (boxId: string) => void,
  onTextChanged?: (boxId: string, newContent: string) => void
): any {
  const boxObj = createBoxObject({
    left: box.x || 0,
    top: box.y || 0,
    width: box.width || 160,
    height: box.height || 80,
    fill: box.color || '#fff',
    boxId: box.id,
    isPortal: !!box.linkedCanvasId,
    content: box.content || '',
  });

  // Add text label with editing support
  boxObj.addTextLabel(box.content || 'New Box', canvas, (newContent: string) => {
    onTextChanged?.(box.id, newContent);
  });

  // Event handlers
  boxObj.on('mousedblclick', () => {
    onDoubleClick?.(box.id);
  });

  boxObj.on('selected', () => {
    onSelect?.(box.id);
  });

  boxObj.on('mouseenter', () => {
    boxObj.enterHover();
    canvas.renderAll();
  });

  boxObj.on('mouseleave', () => {
    boxObj.leaveHover();
    canvas.renderAll();
  });

  // Make the box bring its text to front when selected
  boxObj.on('selected', () => {
    if (boxObj.textObject) {
      boxObj.textObject.bringToFront();
    }
  });

  canvas.add(boxObj);
  return boxObj;
}

// Update a box on the canvas
export function updateBoxOnCanvas(
  canvas: any,
  box: any
): any {
  const obj = canvas.getObjects().find(
    (o: any) => o.type === 'box' && o.boxId === box.id
  );

  if (!obj) return null;

  obj.set({
    left: box.x || 0,
    top: box.y || 0,
    width: box.width || 160,
    height: box.height || 80,
    fill: box.color || '#fff',
  });

  if (obj.textObject) {
    obj.textObject.set({ 
      text: box.content || '',
      width: (box.width || 160) - 20
    });
  }
  
  canvas.renderAll();
  return obj;
}

// Remove a box from the canvas
export function removeBoxFromCanvas(canvas: any, boxId: string) {
  const obj = canvas.getObjects().find(
    (o: any) => o.type === 'box' && o.boxId === boxId
  );
  if (obj) {
    if (obj.textObject) {
      canvas.remove(obj.textObject);
    }
    canvas.remove(obj);
    canvas.renderAll();
  }
}

// Get current canvas state
export function getCanvasState(canvas: any): any {
  const vpt = canvas.viewportTransform;
  return {
    zoom: canvas.getZoom(),
    panX: vpt ? vpt[4] : 0,
    panY: vpt ? vpt[5] : 0,
  };
}

// Clear the canvas
export function clearCanvas(canvas: any) {
  canvas.clear();
}

// Fit canvas to window
// Finds the nearest parent with actual dimensions to size the canvas
export function fitCanvasToWindow(canvas: any, containerElement?: HTMLElement | null) {
  let container = containerElement;
  
  // If no container provided, use the canvas element and walk up
  if (!container) {
    container = canvas.getElement();
    if (!container) return;

    // The canvas element itself may not have dimensions yet (flexbox parent)
    // Walk up the DOM tree to find a parent with actual dimensions
    let current: HTMLElement | null = container;
    let attempts = 0;
    while (current && (current.clientWidth === 0 || current.clientHeight === 0) && attempts < 5) {
      current = current.parentElement;
      attempts++;
    }

    if (!current || current.clientWidth === 0 || current.clientHeight === 0) {
      current = container;
    }
    container = current;
  }

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  canvas.setWidth(width);
  canvas.setHeight(height);

  // Set background to transparent (grid is in CSS)
  canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));

  // Center the viewport
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.renderAll();
}
