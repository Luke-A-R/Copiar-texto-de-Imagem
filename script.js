let uploadedFile = null;

document.getElementById('imageInput').addEventListener('change', function (event) {
    uploadedFile = event.target.files[0];
    if (uploadedFile) {
        loadImage(uploadedFile);
    }
});

const dropArea = document.getElementById('dropArea');
const pasteArea = document.getElementById('pasteArea');

// Evitar o comportamento padrão para os eventos de arrastar
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    pasteArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Destacar a área de drop quando uma imagem é arrastada sobre ela
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    pasteArea.addEventListener(eventName, () => pasteArea.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    pasteArea.addEventListener(eventName, () => pasteArea.classList.remove('dragover'), false);
});

// Processar a imagem quando solta na área de drop
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile) {
        loadImage(uploadedFile);
    }
}

// Capturar evento de colagem (Ctrl + V)
document.addEventListener('paste', function (e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            uploadedFile = blob;
            loadImage(blob);
            break;
        }
    }
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById('preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

document.getElementById('extractButton').addEventListener('click', function () {
    if (!uploadedFile) {
        alert('Por favor, carregue uma imagem.');
        return;
    }

    const language = document.getElementById('language').value;
    const output = document.getElementById('output');
    const confidenceDetails = document.getElementById('confidenceDetails');
    const toggleDetailsButton = document.getElementById('toggleDetailsButton');
    const copyButton = document.getElementById('copyButton');
    output.innerText = 'Processando...';
    confidenceDetails.innerHTML = '';
    toggleDetailsButton.classList.add('hidden');
    copyButton.classList.add('hidden');

    Tesseract.recognize(
        uploadedFile,
        language,
        {
            logger: m => console.log(m)
        }
    ).then(({ data: { text, words } }) => {
        output.innerText = text;

        confidenceDetails.innerHTML = words.map(word => `
            <div>
                <strong>${word.text}</strong>: ${(word.confidence * 100).toFixed(2)}% de confiança
            </div>
        `).join('');

        toggleDetailsButton.classList.remove('hidden');
        copyButton.classList.remove('hidden');
    }).catch(err => {
        console.error(err);
        output.innerText = 'Erro ao processar a imagem.';
    });
});

document.getElementById('toggleDetailsButton').addEventListener('click', function () {
    const confidenceDetails = document.getElementById('confidenceDetails');
    const toggleDetailsButton = document.getElementById('toggleDetailsButton');

    if (confidenceDetails.style.display === 'none') {
        confidenceDetails.style.display = 'block';
        toggleDetailsButton.innerText = 'Ocultar Detalhes';
    } else {
        confidenceDetails.style.display = 'none';
        toggleDetailsButton.innerText = 'Mostrar Detalhes';
    }
});

document.getElementById('copyButton').addEventListener('click', function () {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.innerText)
        .then(() => {
            alert('Texto copiado para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar o texto:', err);
        });
});