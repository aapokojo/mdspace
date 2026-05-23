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
  rect.addTextLabel = function(content: string, canvas: any, onTextChanged?: (newContent: string) => void, onStartEditing?: () => void) {
    if (this.textObject) {
      this.textObject.set({ text: content });
      canvas.renderAll();
      return;
    }

    // Create IText for editable text
    // Use relative positioning - text will be positioned relative to box via updateTextPosition
    const text = new fabric.IText(content, {
      fontSize: 12,
      fill: '#222222',
      fontFamily: 'Raleway, sans-serif',
      lineHeight: 1.5,
      width: this.width - 20,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      selectable: true,  // Must be selectable to be editable
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
      lockMovementX: true,  // Prevent text from being dragged separately from box
      lockMovementY: true,  // Prevent text from being dragged separately from box
      wrap: true,  // Enable text wrapping
    });

    // Store reference to box
    text.boxId = this.boxId;
    text.isBoxText = true;

    // Single click on text selects and focuses it for editing
    text.on('mousedown', (opt: any) => {
      const evt = opt.e;
      if (!text.isEditing) {
        // Single click: select text and enter editing mode
        canvas.setActiveObject(text);
        text.set({ selectable: true, evented: true });
        text.enterEditing();
        text.selectAll();
        evt.preventDefault();
        evt.stopPropagation();
      }
    });

    // Double-click on text to edit (fallback)
    text.on('mousedblclick', (opt: any) => {
      const evt = opt.e;
      canvas.setActiveObject(text);
      text.set({ selectable: true, evented: true });
      text.enterEditing();
      text.selectAll();
      evt.preventDefault();
      evt.stopPropagation();
    });

    // Track if we're in editing mode to batch content updates
    let isEditing = false;

    // When text is edited - do NOT update store during editing
    // (to prevent canvas rebuild which loses focus)
    text.on('changed', () => {
      // No action during editing - store is updated on exit
    });

    // When text editing starts
    text.on('editing:entered', () => {
      isEditing = true;
      this.set({ stroke: '#ccc', strokeWidth: 2 });
      canvas.renderAll();
    });

    // When text editing exits - update store with final content
    text.on('editing:exited', () => {
      isEditing = false;
      this.set({ stroke: '#ddd', strokeWidth: 1 });
      text.set({ selectable: true, evented: true });  // Keep selectable for next edit
      canvas.setActiveObject(this);
      // Update store with final content
      onTextChanged?.(text.get('text'));
      canvas.renderAll();
    });

    this.textObject = text;
    
    // Position text relative to box immediately
    text.set({
      left: this.left + 10,
      top: this.top + 10,
      width: this.width - 20
    });
    
    canvas.add(text);
    text.bringToFront();
    
    // When box moves or is selected, update text position relative to box
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
    // Don't update on selected - this can cause jumping
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

  // Panning state
  let isPanning = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let isSpaceKeyDown = false;
  let isTouchPanning = false;
  let touchStartX = 0;
  let touchStartY = 0;

  // Track space key for panning
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpaceKeyDown = true;
      canvas.setCursor('grab');
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpaceKeyDown = false;
      canvas.setCursor('default');
      isPanning = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Touch event handlers for panning
  const handleTouchStart = (e: TouchEvent) => {
    if (isSpaceKeyDown && e.touches.length === 1) {
      isTouchPanning = true;
      isPanning = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      lastPosX = touchStartX;
      lastPosY = touchStartY;
      canvas.setCursor('grab');
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isTouchPanning && e.touches.length === 1) {
      const vpt = canvas.viewportTransform;
      if (!vpt) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - lastPosX;
      const deltaY = currentY - lastPosY;

      vpt[4] += deltaX;
      vpt[5] += deltaY;

      canvas.setViewportTransform(vpt);
      canvas.renderAll();

      lastPosX = currentX;
      lastPosY = currentY;
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    isTouchPanning = false;
    isPanning = false;
    canvas.setCursor('default');
  };

  canvas.getElement()?.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.getElement()?.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.getElement()?.addEventListener('touchend', handleTouchEnd);

  // Enable canvas scrolling with mouse wheel (pan instead of zoom when not using ctrl/cmd)
  // And zoom with ctrl/cmd + scroll
  canvas.on('mouse:wheel', (opt: any) => {
    const evt = opt.e;
    const isShiftDown = evt.shiftKey;
    const isCtrlDown = evt.ctrlKey || evt.metaKey; // cmd on Mac

    // If shift is down, scroll horizontally
    // If neither shift nor ctrl, scroll vertically (pan)
    // If ctrl/cmd is down, zoom
    
    if (isCtrlDown) {
      // Zoom behavior
      const delta = evt.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;

      const pointer = canvas.getPointer(evt);
      canvas.zoomToPoint(pointer, zoom);
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      // Pan/scroll behavior
      const vpt = canvas.viewportTransform;
      if (!vpt) return;

      // Use wheel delta for panning
      // For shift+scroll: horizontal panning
      // For trackpad horizontal scroll: use deltaX
      // For regular scroll: vertical panning
      let deltaX = 0;
      let deltaY = 0;
      
      if (isShiftDown) {
        deltaX = evt.deltaY || evt.wheelDeltaY || 0;
      } else {
        // Check for horizontal wheel (trackpad two-finger scroll)
        deltaX = evt.deltaX || evt.wheelDeltaX || 0;
        deltaY = evt.deltaY || evt.wheelDeltaY || 0;
      }

      // Adjust pan based on zoom level (higher zoom = more sensitive panning)
      const zoom = canvas.getZoom();
      vpt[4] += deltaX / zoom;
      vpt[5] += deltaY / zoom;

      canvas.setViewportTransform(vpt);
      canvas.renderAll();
      evt.preventDefault();
      evt.stopPropagation();
    }
  });

  // Panning with right mouse button or space+drag
  canvas.on('mouse:down', (opt: any) => {
    const evt = opt.e;
    // Check if we clicked on a box text (don't pan)
    const target = opt.target;
    if (target && target.isBoxText) {
      // If clicking on text that's already being edited, don't do anything special
      return;
    }
    
    // Check if we clicked on a box (don't pan if dragging a box)
    if (target && target.type === 'box') {
      return;
    }
    
    if (evt.button === 2 || isSpaceKeyDown) { // Right mouse button or space
      isPanning = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      canvas.setCursor('grab');
      evt.preventDefault();
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
  onTextChanged?: (boxId: string, newContent: string) => void,
  onMoved?: (boxId: string, newX: number, newY: number) => void
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

  // Add box to canvas first
  canvas.add(boxObj);

  // Add text label with editing support - text will be added on top of box
  boxObj.addTextLabel(box.content || 'New Box', canvas, (newContent: string) => {
    onTextChanged?.(box.id, newContent);
  });

  // Track position for movement delta calculation
  let lastLeft = boxObj.left;
  let lastTop = boxObj.top;

  // Event handlers
  boxObj.on('mousedblclick', () => {
    onDoubleClick?.(box.id);
  });

  boxObj.on('selected', () => {
    onSelect?.(box.id);
    if (boxObj.textObject) {
      boxObj.textObject.bringToFront();
    }
  });

  boxObj.on('mouseenter', () => {
    boxObj.enterHover();
    canvas.renderAll();
  });

  boxObj.on('mouseleave', () => {
    boxObj.leaveHover();
    canvas.renderAll();
  });

  // Track movement and calculate delta
  // Only update lastLeft/lastTop in modified handler to ensure onMoved is called
  boxObj.on('moving', () => {
    // Update text position while moving
    if (boxObj.textObject) {
      boxObj.textObject.set({
        left: boxObj.left + 10,
        top: boxObj.top + 10
      });
      canvas.renderAll();
    }
  });

  boxObj.on('modified', () => {
    const deltaX = boxObj.left - lastLeft;
    const deltaY = boxObj.top - lastTop;
    
    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
      onMoved?.(box.id, boxObj.left, boxObj.top);
    }
    
    // Update tracking position after modification
    lastLeft = boxObj.left;
    lastTop = boxObj.top;
    
    // Update text position after move
    if (boxObj.textObject) {
      boxObj.textObject.set({
        left: boxObj.left + 10,
        top: boxObj.top + 10,
        width: boxObj.width - 20
      });
      canvas.renderAll();
    }
  });

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
