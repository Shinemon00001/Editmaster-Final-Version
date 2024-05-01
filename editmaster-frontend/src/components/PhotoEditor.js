import React, { useRef, useEffect, useState } from 'react';
import GoogleDrivePicker from '../components/GoogleDrivePicker';
import { fabric } from 'fabric';

const PhotoEditor = ({ socket }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('foreground');
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [selectedFont, setSelectedFont] = useState('Times New Roman');
  const [filters, setFilters] = useState({
    grayscale: false,
    invert: false,
    blackWhite: false,
    sepia: false,
    polaroid: false,
    brightness: 0,
    contrast: 0,
    hue: 0,
    saturation: 0,
  });
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [brushWidth, setBrushWidth] = useState(5);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // New state for selected color

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current);
    setCanvas(canvasInstance);
    adjustCanvasSize(canvasInstance);

    const handleResize = () => {
      adjustCanvasSize(canvasInstance);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvasInstance.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  useEffect(() => {
    if (canvas) {
      // Event listener to receive image data from the server
      socket.on('ImageDataResponse', ({ ImageJSON }) => {
        canvas.loadFromJSON(ImageJSON, () => {
          canvas.renderAll();
        });
      });

      // Cleanup function to remove the event listener when component unmounts
      return () => {
        socket.off('ImageDataResponse');
      };
    }
  }, [canvas, socket]);

  useEffect(() => {
    if (canvas) {
      if (isCropping) {
        canvas.forEachObject(obj => {
          if (obj !== cropRect) {
            obj.set('selectable', false);
          }
        });
        canvas.defaultCursor = 'crosshair';
      } else if (isDrawingMode) {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = getBrush(selectedTool);
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.freeDrawingBrush.color = selectedColor; // Apply selected color to drawing brush
        canvas.defaultCursor = 'crosshair';
      } else {
        canvas.isDrawingMode = false;
        canvas.defaultCursor = 'default';
        canvas.forEachObject(obj => {
          obj.set('selectable', true);
        });
      }
    }
  }, [isCropping, isDrawingMode, cropRect, selectedTool, brushWidth, canvas, selectedColor]);

  
  const handleLayerChange = (event) => {
    setSelectedLayer(event.target.value);
  };

  const handleBackgroundImageAdd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleBackgroundImageUpload;
    input.click();
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      fabric.util.loadImage(url, (img) => {
        if (img) {
          canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
          });
        } else {
          console.error('Error loading background image');
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleForegroundImageAdd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleForegroundImageUpload;
    input.click();
  };

  const handleForegroundImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      fabric.Image.fromURL(url, (img) => {
        const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
        img.scale(scaleFactor);
        canvas.add(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropImage = () => {
    setIsCropping(true);
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 360,
      height: 240,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: '#ff0000',
      strokeWidth: 2,
      cornerColor: '#ff0000',
      cornerSize: 6,
      transparentCorners: false,
    });
    canvas.add(rect);
    setCropRect(rect);
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    canvas.remove(cropRect);
    setCropRect(null);
  };

  const handleConfirmCrop = () => {
    setIsCropping(false);
    canvas.remove(cropRect);
    setCropRect(null);

    setTimeout(() => {
      const croppedImage = canvas.toDataURL({
        left: cropRect.left,
        top: cropRect.top,
        width: cropRect.width,
        height: cropRect.height,
      });
      const img = new Image();
      img.onload = () => {
        const fabricImg = new fabric.Image(img);
        fabricImg.set({
          left: cropRect.left,
          top: cropRect.top,
        });
        canvas.add(fabricImg);
        canvas.renderAll();
      };
      img.src = croppedImage;
    }, 0);
  };

  const adjustCanvasSize = (canvasInstance) => {
    canvasInstance.setWidth(window.innerWidth * 0.9);
    canvasInstance.setHeight(window.innerHeight * 0.8);
    canvasInstance.renderAll();
  };

  const handleTextAdd = () => {
    const text = new fabric.Textbox('Enter text here', {
      left: 50,
      top: 50,
      width: 150,
      fontSize: 20,
      fontFamily: selectedFont,
    });
    canvas.add(text).setActiveObject(text);
  };

  const handleFontChange = (event) => {
    const selectedFont = event.target.value;
    setSelectedFont(selectedFont);
    canvas.getActiveObject().set("fontFamily", selectedFont);
    canvas.requestRenderAll();
  };

  const handleDownload = () => {
    const dataURL = canvas.toDataURL({ format: selectedFormat });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `edited_image.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked,
    }));
    if (checked) {
      applyFilter(name);
    } else {
      removeFilter(name);
    }
  };

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: parseInt(value),
    }));
    applyFilter(name, parseInt(value));
  };

  const applyFilter = (filterName, value = null) => {
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === 'image' && obj === canvas.getActiveObject()) {
        let filter;
        switch (filterName) {
          case 'grayscale':
            filter = new fabric.Image.filters.Grayscale();
            break;
          case 'invert':
            filter = new fabric.Image.filters.Invert();
            break;
          case 'blackWhite':
            filter = new fabric.Image.filters.BlackWhite();
            break;
          case 'sepia':
            filter = new fabric.Image.filters.Sepia();
            break;
          case 'polaroid':
            filter = new fabric.Image.filters.Polaroid();
            break;
          case 'brightness':
            filter = new fabric.Image.filters.Brightness({ brightness: value * 2.55 }); // fabric.js expects values in the range of -100 to 100
            break;
          case 'contrast':
            filter = new fabric.Image.filters.Contrast({ contrast: value / 100 }); // fabric.js expects values in the range of -1 to 1
            break;
          case 'hue':
            filter = new fabric.Image.filters.HueRotation({ rotation: value }); // fabric.js expects values in the range of -1 to 1
            break;
          case 'saturation':
            filter = new fabric.Image.filters.Saturation({ saturation: value / 100 }); // fabric.js expects values in the range of -1 to 1
            break;
          default:
            break;
        }
        obj.filters.push(filter);
        obj.applyFilters();
      }
    });
    canvas.renderAll();
  };

  const removeFilter = (filterName) => {
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === 'image' && obj === canvas.getActiveObject()) {
        const index = obj.filters.findIndex(filter => filter.type === filterName);
        obj.filters.splice(index, 1);
        obj.applyFilters();
      }
    });
    canvas.renderAll();
  };

  const handleToolChange = (event) => {
    setSelectedTool(event.target.value);
  };

  const getBrush = () => {
    switch (selectedTool) {
      case 'pencil':
        return new fabric.PencilBrush(canvas);
      case 'spray':
        return new fabric.SprayBrush(canvas);
      case 'brush':
        return new fabric.CircleBrush(canvas);
      default:
        return new fabric.PencilBrush(canvas);
    }
  };

  const handleBrushWidthChange = (event) => {
    setBrushWidth(parseInt(event.target.value));
  };

  const handleDrawingModeChange = (event) => {
    setIsDrawingMode(event.target.checked);
  };

  const handleDelete = () => {
    canvas.getActiveObjects().forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject().renderAll();
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleSendCanvasData = () => {
    if (canvas) {
      const canvasData = canvas.toJSON();
      socket.emit('collabPhotoSend', canvasData);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <div>
          <input
            type="radio"
            id="foreground"
            name="layer"
            value="foreground"
            checked={selectedLayer === 'foreground'}
            onChange={handleLayerChange}
          />
          <label htmlFor="foreground">Foreground</label>

          <input
            type="radio"
            id="background"
            name="layer"
            value="background"
            checked={selectedLayer === 'background'}
            onChange={handleLayerChange}
          />
          <label htmlFor="background">Background</label>
          <GoogleDrivePicker/>
        </div>

        {selectedLayer === 'foreground' ? (
          <>
            <button onClick={handleForegroundImageAdd}>Upload Image</button>
            <button onClick={handleCropImage}>Crop Image</button>
            <button onClick={handleTextAdd}>Add Text</button>
            <button onClick={handleDelete}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={handleBackgroundImageAdd}>Add Background Image</button>
            <button onClick={() => { const image = new fabric.Image(''); canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas)); }}>Clear Background</button>
            <button disabled>Crop Image</button>
            <button disabled>Add Text</button>
          </>
        )}

        <canvas
          ref={canvasRef}
        />

        <div>
          <button style={{ visibility: isCropping ? 'visible' : 'hidden' }} onClick={handleConfirmCrop} disabled={!isCropping}>Confirm Crop</button>
          <button style={{ visibility: isCropping ? 'visible' : 'hidden' }} onClick={handleCancelCrop} disabled={!isCropping}>Cancel Crop</button>
        </div>

        <div>
          <select value={selectedFont} onChange={handleFontChange}>
            {['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="svg">SVG</option>
          </select>
          <button onClick={handleDownload}>Download</button>
          <button onClick={handleSendCanvasData}>Send Canvas Data</button> {/* Button to send canvas data */}
        </div>
      </div>
      <div style={{ borderLeft: '1px solid black', paddingLeft: '10px' }}>
        <div style={{ marginTop: 30 }}>
          <input
            type="checkbox"
            id="grayscale"
            name="grayscale"
            checked={filters.grayscale}
            onChange={handleFilterChange}
          />
          <label htmlFor="grayscale">Grayscale</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="invert"
            name="invert"
            checked={filters.invert}
            onChange={handleFilterChange}
          />
          <label htmlFor="invert">Invert</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="sepia"
            name="sepia"
            checked={filters.sepia}
            onChange={handleFilterChange}
          />
          <label htmlFor="sepia">Sepia</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="polaroid"
            name="polaroid"
            checked={filters.polaroid}
            onChange={handleFilterChange}
          />
          <label htmlFor="polaroid">Polaroid</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="blackWhite"
            name="blackWhite"
            checked={filters.blackWhite}
            onChange={handleFilterChange}
          />
          <label htmlFor="blackWhite">Black/White</label>
        </div>
        <div style={{ marginTop: 25 }}>
          <label htmlFor="brightness">Brightness: </label>
          <input
            type="range"
            id="brightness"
            name="brightness"
            min="0"
            max="100"
            value={filters.brightness}
            onChange={handleSliderChange}
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label htmlFor="contrast">Contrast:</label>
          <input
            type="range"
            id="contrast"
            name="contrast"
            min="0"
            max="100"
            value={filters.contrast}
            onChange={handleSliderChange}
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label htmlFor="hue">Hue:</label>
          <input
            type="range"
            id="hue"
            name="hue"
            min="0"
            max="100"
            value={filters.hue}
            onChange={handleSliderChange}
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label htmlFor="saturation">Saturation:</label>
          <input
            type="range"
            id="saturation"
            name="saturation"
            min="0"
            max="100"
            value={filters.saturation}
            onChange={handleSliderChange}
            style={{ width: '100px' }}
          />
        </div>

        <div style={{ marginTop: 30 }}>
          <input
            type="checkbox"
            id="drawingMode"
            name="drawingMode"
            checked={isDrawingMode}
            onChange={handleDrawingModeChange}
          />
          <label htmlFor="drawingMode">Drawing Mode</label>
        </div>

        <div>
          <select id="tool" value={selectedTool} onChange={handleToolChange}>
            <option value="pencil">Pencil</option>
            <option value="spray">Spray</option>
            <option value="brush">Brush</option>
            {/* Add more options here */}
          </select>
        </div>

        <div>
          <label htmlFor="brushWidth">Brush Width:</label>
          <input
            type="range"
            id="brushWidth"
            name="brushWidth"
            min="1"
            max="100"
            value={brushWidth}
            onChange={handleBrushWidthChange}
            style={{ width: '100px' }}
          />
        </div>

        <div style={{ marginTop: 10, marginLeft: 20 }}>
          <input type="color" id="favcolor" name="favcolor" value={selectedColor} onChange={handleColorChange} />
        </div>

      </div>
    </div>
  );
};

export default PhotoEditor;
