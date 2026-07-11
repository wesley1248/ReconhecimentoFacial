let localStream = null;
const videoElement = document.getElementById('webcam');
const cameraModalElement = document.getElementById('cameraModal');

cameraModalElement.addEventListener('shown.bs.modal', async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });

        videoElement.srcObject = localStream;

    } catch (error) {
        console.error("Erro ao iniciar a câmera: ", error);
        alert("Não foi possível acessar a sua câmera. Verifique as permissões do navegador.");

        const modalInstance = bootstrap.Modal.getInstance(cameraModalElement);
        modalInstance.hide();
    }
});

cameraModalElement.addEventListener('hide.bs.modal', () => {

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    videoElement.srcObject = null;
});