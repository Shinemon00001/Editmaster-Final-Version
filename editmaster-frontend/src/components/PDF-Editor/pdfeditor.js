import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleDrivePicker from '../GoogleDrivePicker';
import WebViewer from '@pdftron/webviewer';

const PdfEditor = ({ socket }) => {
  const viewer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let instance = null;
    let viewerInstance = null; // Variable to store the viewer instance
  
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
  
      if (file) {
        if (!instance) {
          instance = await WebViewer(
            {
              path: '/webviewer/lib',
              licenseKey: 'demo:1708424904260:7f5bd4750300000000df8aa6f9b502a88e6a593c6dc38d95583e94f409',
              fullAPI: true,
            },
            viewer.current,
          );
          viewerInstance = instance.docViewer; // Store the viewer instance
        }
  
        const { documentViewer, annotationManager } = instance.Core;
        documentViewer.loadDocument(file, { filename: file.name });
  
        documentViewer.addEventListener('documentLoaded', () => {
          const doc = documentViewer.getDocument();
          annotationManager.addEventListener('annotationChanged', async () => {
            const xfdfString = await annotationManager.exportAnnotations();
            const options = { xfdfString };
            const data = await doc.getFileData(options);
            const arr = new Uint8Array(data);
            const blob = new Blob([arr], { type: 'application/pdf' });
          
            socket.emit('pdfBlob', blob);
            console.log('pdf-data-send');
            console.log(typeof pdfBlob); // Check the type of pdfBlob
          });
  
        });
      }
    };
  
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileUpload);
  
    // Listen for PdfDataResponse event from the server
    socket.on('PdfDataResponse', ({ pdfBlob }) => {
      // Ensure that viewerInstance is valid before calling loadDocument
      if (viewerInstance) {
        viewerInstance.loadDocument(pdfBlob);
        console.log("pdf-data-received");
      } else {
        console.log("pdf-data-not-received: viewerInstance is not valid");
      }
    });
    
  
    return () => {
      if (fileInput) {
        fileInput.removeEventListener('change', handleFileUpload);
      }
      // Cleanup socket event listener
      socket.off('PdfDataResponse');
    };
  }, [socket]);
  

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div>
      <input type="file" id="file-input" accept=".pdf" />
      <GoogleDrivePicker />
      <button  onClick={handleLogout}>Logout</button>
      <div>
        <div style={{height: '97vh' }} ref={viewer}></div>
      </div>
    </div>
  );
};

export default PdfEditor;
  