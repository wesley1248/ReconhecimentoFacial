let localStream = null;
const videoElement = document.getElementById('webcam');
const cameraModalElement = document.getElementById('cameraModal');
const instrucaoText = document.getElementById('instructionText');
const guidelineElement = document.querySelector('.camera-scanner-guideline');

let modelosCarregados = false;
let rostoAlinhado = true; 
let intervaloContagem = null;
let indexEtapa = 0;
let loopAtivo = false;
let timerPreparacao = null;
let timerTransicao = null;
let timerFechamento = null;

const etapas = [
    { id: "frente", mensagem: "Olhe para frente", tempo: 3 },
    { id: "direita", mensagem: "Vire a cabeça para a direita", tempo: 3 },
    { id: "esquerda", mensagem: "Vire a cabeça para a esquerda", tempo: 3 },
    { id: "cima", mensagem: "Olhe para cima", tempo: 3 },
    { id: "baixo", mensagem: "Olhe para baixo", tempo: 3 }
];


cameraModalElement.addEventListener('shown.bs.modal', async () => {
    try {
        if (!modelosCarregados) {
            instrucaoText.textContent = "Carregando Inteligência Artificial...";
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            modelosCarregados = true;
        }

        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });

        videoElement.srcObject = localStream;

        instrucaoText.textContent = "Prepare-se...";
        iniciarLoopDeteccao(); 

        timerPreparacao = setTimeout(() => {
            iniciarFluxoDeCaptura();
        }, 2000);

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

    loopAtivo = false;
    videoElement.srcObject = null;

    if (intervaloContagem) {
        clearInterval(intervaloContagem);
        intervaloContagem = null;
    }

    if (timerPreparacao) clearTimeout(timerPreparacao);
    if (timerTransicao) clearTimeout(timerTransicao);
    if (timerFechamento) clearTimeout(timerFechamento);

    indexEtapa = 0;
    rostoAlinhado = true;
});

function iniciarFluxoDeCaptura() {
    indexEtapa = 0;
    executarProximaEtapa();
}

function executarProximaEtapa() {
    if (indexEtapa >= etapas.length) {
        finalizarSimulacao();
        return;
    }

    const etapa = etapas[indexEtapa];
    let tempoRestante = etapa.tempo;

    if (guidelineElement) {
        guidelineElement.style.animation = 'scanner-pulse 2s infinite ease-in-out';
        guidelineElement.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.65)';
        guidelineElement.style.borderColor = '#00d4ff';
    }

    instrucaoText.textContent = `${etapa.mensagem} (${tempoRestante}s)`;

    intervaloContagem = setInterval(() => {

        if (!rostoAlinhado) {
            if (guidelineElement) {
                guidelineElement.style.animation = 'none'; 
                guidelineElement.style.boxShadow = '0 0 0 9999px rgba(231, 76, 60, 0.45)'; 
                guidelineElement.style.borderColor = '#e74c3c'; 
            }
            tempoRestante = etapa.tempo + 1;
            instrucaoText.textContent = "⚠️ Centralize seu rosto no círculo!";
            return; 
        }

        if (guidelineElement && guidelineElement.style.borderColor === 'rgb(231, 76, 60)') {
            guidelineElement.style.animation = 'scanner-pulse 2s infinite ease-in-out';
            guidelineElement.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.65)';
            guidelineElement.style.borderColor = '#00d4ff';
        }

        tempoRestante--;

        if (tempoRestante > 0) {
            instrucaoText.textContent = `${etapa.mensagem} (${tempoRestante}s)`;
        } else {
            clearInterval(intervaloContagem);

            if (guidelineElement) {
                guidelineElement.style.animation = 'none';
                guidelineElement.style.boxShadow = '0 0 0 9999px rgba(46, 204, 113, 0.4)';
                guidelineElement.style.borderColor = '#2ecc71';
            }

            instrucaoText.textContent = "Excelente!";

            timerTransicao = setTimeout(() => {
                indexEtapa++;
                executarProximaEtapa();
            }, 500);

        }
    }, 1000);
}
function finalizarSimulacao() {
    instrucaoText.textContent = "Simulação Concluída!";

    if (guidelineElement) {
        guidelineElement.style.animation = 'none';
        guidelineElement.style.boxShadow = '0 0 0 9999px rgba(46, 204, 113, 0.4)';
        guidelineElement.style.borderColor = '#2ecc71';
    }

    timerFechamento = setTimeout(() => {
        fecharModal();
    }, 2000);
}

function fecharModal() {
    const modalInstance = bootstrap.Modal.getInstance(cameraModalElement);

    if (modalInstance) {
        modalInstance.hide();
    }
}
function iniciarLoopDeteccao() {
    loopAtivo = true;
    detectarRosto();
}

async function detectarRosto() {
    if (!loopAtivo || !localStream) return;

    if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
        requestAnimationFrame(detectarRosto);
        return;
    }

    try {
        const detection = await faceapi.detectSingleFace(
            videoElement,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
        );

        if (detection) {
            const faceCenterX = detection.box.x + (detection.box.width / 2);
            const faceCenterY = detection.box.y + (detection.box.height / 2);

            const videoCenterX = videoElement.videoWidth / 2;
            const videoCenterY = videoElement.videoHeight / 2;

            const diffX = Math.abs(faceCenterX - videoCenterX);
            const diffY = Math.abs(faceCenterY - videoCenterY);

            const centralizado = (diffX < 75 && diffY < 85);
            rostoAlinhado = centralizado;

        } else {
            rostoAlinhado = false;
        }
    } catch (err) {
        console.error("Erro interno no loop da IA: ", err);
        rostoAlinhado = false;
    }

    requestAnimationFrame(detectarRosto);
}
