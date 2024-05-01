import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollabClient } from '@pdftron/collab-client';
import WebViewer from '@pdftron/webviewer';

const PdfEditor = ({ socket }) => {
  const viewer = useRef(null);
  const navigate = useNavigate();
  const [collabClient, setCollabClient] = useState(null);

  useEffect(() => {
    const initializeCollabClient = async () => {
      const collabClientInstance = await CollabClient.create();
      setCollabClient(collabClientInstance);
    };

    initializeCollabClient();

    return () => {
      // Cleanup function
      if (collabClient) {
        collabClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let instance = null;

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

            if (collabClient) {
              collabClient.sendAnnotation(blob);
            }
          });
        });
      }
    };

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileUpload);

    return () => {
      if (fileInput) {
        fileInput.removeEventListener('change', handleFileUpload);
      }
    };
  }, [collabClient]);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div>
      <input type="file" id="file-input" accept=".pdf" />
      <button onClick={handleLogout}>Logout</button>
      <div>
        <div style={{ height: '97vh' }} ref={viewer}></div>
      </div>
    </div>
  );
};

export default PdfEditor;
