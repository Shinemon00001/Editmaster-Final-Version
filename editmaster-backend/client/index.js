const viewerElement = document.getElementById('viewer');

let annotationManager = null;
const DOCUMENT_ID = 'webviewer-demo-1';
const hostName = window.location.hostname;
const url = `ws://${hostName}:8080`;
const connection = new WebSocket(url);
const nameList = ['Andy', 'Andrew', 'Logan', 'Justin', 'Matt', 'Sardor', 'Zhijie', 'James', 'Kristian', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'David', 'Joseph', 'Thomas', 'Naman', 'Nancy', 'Sandra'];
const serializer = new XMLSerializer();

connection.onerror = error => {
  console.warn(`Error from WebSocket: ${error}`);
}

WebViewer({
  path: 'lib', // path to the PDFTron 'lib' folder
  initialDoc: 'demo.pdf',
  documentXFDFRetriever: async () => {
    const rows = await loadXfdfStrings(DOCUMENT_ID);
    return JSON.parse(rows).map(row => row.xfdfString);
  },
}, viewerElement).then(instance => {

  // Instance is ready here
  instance.UI.openElements(['leftPanel']);
  annotationManager = instance.Core.documentViewer.getAnnotationManager();
  // Assign a random name to client
  annotationManager.setCurrentUser(nameList[Math.floor(Math.random() * nameList.length)]);
  annotationManager.addEventListener('annotationChanged', async e => {
    // If annotation change is from import, return
    if (e.imported) {
      return;
    }

    const xfdfString = await annotationManager.exportAnnotationCommand();
    // Parse xfdfString to separate multiple annotation changes to individual annotation change
    const parser = new DOMParser();
    const commandData = parser.parseFromString(xfdfString, 'text/xml');
    const addedAnnots = commandData.getElementsByTagName('add')[0];
    const modifiedAnnots = commandData.getElementsByTagName('modify')[0];
    const deletedAnnots = commandData.getElementsByTagName('delete')[0];

    // List of added annotations
    addedAnnots.childNodes.forEach((child) => {
      sendAnnotationChange(child, 'add');
    });

    // List of modified annotations
    modifiedAnnots.childNodes.forEach((child) => {
      sendAnnotationChange(child, 'modify');
    });

    // List of deleted annotations
    deletedAnnots.childNodes.forEach((child) => {
      sendAnnotationChange(child, 'delete');
    });
  });

  connection.onmessage = async (message) => {
    const data = message.data;

    // Check if the data is a Blob
    if (data instanceof Blob) {
      // Handle Blob data
      const blobData = await data.text(); // Convert Blob to text
      
      // Process the Blob data further as needed
    } else {
      // Assuming JSON data is received
      try {
        const parsedData = JSON.parse(data);
        const { documentId, xfdfString } = parsedData;

        if (documentId === DOCUMENT_ID) {
          const annotations = await annotationManager.importAnnotationCommand(xfdfString);
          await annotationManager.drawAnnotationsFromList(annotations);
        }
      } catch (error) {
        console.error("Error parsing JSON data:", error);
      }
    }
  };
});

const loadXfdfStrings = (documentId) => {
  return new Promise((resolve, reject) => {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'GET',
    }).then((res) => {
      if (res.status < 400) {
        res.text().then(xfdfStrings => {
          resolve(xfdfStrings);
        });
      } else {
        reject(res);
      }
    });
  });
};


// wrapper function to convert xfdf fragments to full xfdf strings
const convertToXfdf = (changedAnnotation, action) => {
  let xfdfString = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields />`;
  if (action === 'add') {
    xfdfString += `<add>${changedAnnotation}</add><modify /><delete />`;
  } else if (action === 'modify') {
    xfdfString += `<add /><modify>${changedAnnotation}</modify><delete />`;
  } else if (action === 'delete') {
    xfdfString += `<add /><modify /><delete>${changedAnnotation}</delete>`;
  }
  xfdfString += `</xfdf>`;
  return xfdfString;
}

// helper function to send annotation changes to WebSocket server
const sendAnnotationChange = (annotation, action) => {
  if (annotation.nodeType !== annotation.TEXT_NODE) {
    const annotationString = serializer.serializeToString(annotation);
    connection.send(JSON.stringify({
      documentId: DOCUMENT_ID,
      annotationId: annotation.getAttribute('name'),
      xfdfString: convertToXfdf(annotationString, action)
    }));
  }
}