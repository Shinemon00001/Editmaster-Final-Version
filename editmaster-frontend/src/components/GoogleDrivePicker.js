import React, { useEffect } from 'react';
// eslint-disable-next-line
import useDrivePicker from 'react-google-drive-picker';

export default function GoogleDrivePicker() {

    const [openPicker, data] = useDrivePicker()

    const handleOpenPicker = () => {
        openPicker({
            clientId: "512564755186-6kbh3siekio32m6v1k0n6id9klgpichd.apps.googleusercontent.com",
            developerKey: "AIzaSyASBplxr4F4DXyaz2k3zNXXAGu2G5hoocU",
            viewId: "DOCS",
            token:"ya29.a0Ad52N38optN9b9QLeQM2RUNcJJCPcYH1X9rx2zngnelV2Fqm_m1Fpsr4wRDiSQ0UxzszHvVQTTUGDYsarSG30VUYqC2zWB9qpyiasa-l2cbWrDPyiiN2tG_fs9EXCHB4PX5HPXtF4Hbnxq8kKUoxw0Vg5LTx1pgpYjaXaCgYKAYESARESFQHGX2MiGdXPMTPetD-UO95Xs02hLg0171",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true
        })
    }

    useEffect(()=> {
        if(data){
            data.docs.map((i) => console.log(i))
        }
    },[data])


    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', right: '10px' }}>
                <button onClick={() => handleOpenPicker()}>Google Drive</button>
            </div>
        </div>
    )
}
