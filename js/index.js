// 1. Configuración de Alertas (Toast)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#1e2332',
    color: '#fff',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// 2. Variables Globales
let tasaCambio = 0;
let tramosComision = [];
let cuentaZelle = "";

// 3. Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializar();
    setupListeners(); 
});

// --- FUNCIONES DEL LOADER ---
function actualizarLoader(progreso, mensaje) {
    const bar = document.getElementById('main-progress-bar');
    const percentText = document.getElementById('progress-percent');
    const statusText = document.getElementById('loader-status-text');

    if(bar) bar.style.width = `${progreso}%`;
    if(percentText) percentText.innerText = `${progreso}%`;
    if(statusText && mensaje) statusText.innerText = mensaje;
}

function rotarTips() {
    const tips = document.querySelectorAll('.tip-item');
    if(!tips.length) return null;
    let currentTip = 0;
    tips[currentTip].classList.add('active');

    return setInterval(() => {
        tips[currentTip].classList.remove('active');
        currentTip = (currentTip + 1) % tips.length;
        tips[currentTip].classList.add('active');
    }, 2500);
}

// --- INICIALIZAR TODO ---
async function inicializar() {
    const startTime = Date.now();
    const tipInterval = rotarTips();

    const quitarLoader = () => {
        const loader = document.getElementById('loader-wrapper');
        if(!loader) return;
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.remove(), 800);
    };

    try {
        actualizarLoader(15, "Iniciando protocolos de seguridad...");

        if(typeof supabaseClient === 'undefined') {
            throw new Error("supabaseClient no definido. Revisa la carga de la librería Supabase.");
        }

        await new Promise(r => setTimeout(r, 600)); // Delay estético
        actualizarLoader(45, "Sincronizando con base de datos...");

        // Consultas en paralelo
        const [configResult, comisionesResult] = await Promise.all([
            supabaseClient.from('config').select('*').limit(1).single(),
            supabaseClient.from('comisiones').select('*').order('monto_min', { ascending: true })
        ]);

        if(configResult.error) throw configResult.error;
        if(comisionesResult.error) throw comisionesResult.error;

        actualizarLoader(80, "Actualizando tasas y comisiones...");

        // Guardar datos globales
        const config = configResult.data ?? {};
        tasaCambio = config.tasa_cambio ?? 0;
        cuentaZelle = config.zelle_cuenta ?? 'pago@fastcuba.com';
        tramosComision = comisionesResult.data ?? [];

        // Actualizar DOM
        const tasaPromo = document.getElementById('tasa-promo');
        const zelleAcc = document.getElementById('zelle-account');
        const homeTasaVal = document.getElementById('home-tasa-val');

        if(tasaPromo) tasaPromo.textContent = tasaCambio;
        if(zelleAcc) zelleAcc.textContent = cuentaZelle;
        if(homeTasaVal) homeTasaVal.textContent = `${tasaCambio} CUP`;

        // Actualizar calculadora HOME
        const homeInput = document.getElementById('home-monto-usd');
        if(homeInput) {
            const montoInicial = parseFloat(homeInput.value) || 0;
            actualizarCalculosHome(montoInicial);
        }

        actualizarLoader(100, "Sistema listo para operar");

    } catch(error) {
        console.error('❌ Error al inicializar:', error);
        const statusText = document.getElementById('loader-status-text');
        if(statusText) {
            statusText.style.color = 'var(--error)';
            statusText.innerText = "Error de conexión. Reintente.";
        }
    } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(4000, 6000 - elapsed); // Asegura que se vea 100% un momento
        setTimeout(() => {
            clearInterval(tipInterval);
            quitarLoader();
        }, delay);
    }
}

// --- LISTENERS DE CALCULADORAS ---
function setupListeners() {
    const homeInput = document.getElementById('home-monto-usd');
    if(homeInput) homeInput.addEventListener('input', e => {
        const monto = parseFloat(e.target.value) || 0;
        actualizarCalculosHome(monto);
    });

    const modalInput = document.getElementById('monto_usd');
    if(modalInput) modalInput.addEventListener('input', e => {
        const monto = parseFloat(e.target.value) || 0;
        const comision = obtenerComision(monto);
        const totalUsd = document.getElementById('total_usd');
        const totalCup = document.getElementById('total_cup');

        if(totalUsd) totalUsd.innerText = `$${(monto + comision).toFixed(2)}`;
        if(totalCup) totalCup.innerText = `${(monto * tasaCambio).toLocaleString('es-CU')} CUP`;
    });
}

// --- CALCULOS ---
function obtenerComision(monto) {
    const tramo = tramosComision.find(t => monto >= t.monto_min && monto <= t.monto_max);
    return tramo ? parseFloat(tramo.comision) : 0;
}

function actualizarCalculosHome(monto) {
    const comision = obtenerComision(monto);
    const totalPagar = monto + comision;
    const recibenCup = monto * tasaCambio;

    const inputCup = document.getElementById('home-monto-cup');
    if(inputCup) inputCup.value = `${recibenCup.toLocaleString('es-CU')} CUP`;

    const comisionVal = document.getElementById('home-comision-val');
    if(comisionVal) comisionVal.innerText = `$${comision.toFixed(2)}`;

    const totalPagarEl = document.getElementById('home-total-pagar');
    if(totalPagarEl) totalPagarEl.innerText = `$${totalPagar.toFixed(2)}`;

    const modalInput = document.getElementById('monto_usd');
    if(modalInput) modalInput.value = monto;
}

// --- FUNCIONES DE MODAL Y BOTONES ---
function abrirModal() {
    const notification = document.getElementById('fab-notification');
    if(notification) notification.style.display = 'none';

    const modal = document.getElementById('modalTransferencia');
    if(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalTransferencia');
    if(modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function nextStep(step) {
    const activeStepDiv = document.querySelector('.step.active');
    if(activeStepDiv && parseInt(activeStepDiv.id.split('-')[1]) < step) {
        const inputs = activeStepDiv.querySelectorAll('input[required]');
        for(let input of inputs){
            if(!input.value.trim()){
                Swal.fire({ icon: 'warning', title: 'Falta información', text: 'Por favor rellena los campos marcados.', background: '#24243e', color: '#fff' });
                return;
            }
        }
    }

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const nextDiv = document.getElementById(`step-${step}`);
    if(nextDiv) nextDiv.classList.add('active');
}

function iniciarConMonto() {
    const monto = parseFloat(document.getElementById('home-monto-usd')?.value) || 0;
    if(monto < 50){
        Swal.fire({ icon: 'warning', title: 'Monto mínimo', text: 'El envío mínimo es de $50 USD', background: '#1e2332', color: '#fff' });
        return;
    }
    abrirModal();
    nextStep(1);
}

function copiarZelle() {
    const texto = document.getElementById('zelle-account')?.innerText;
    if(texto) navigator.clipboard.writeText(texto).then(() => {
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Copiado!', showConfirmButton: false, timer: 1500 });
    });
}

function resetForm() {
    const form = document.getElementById('form-transaccion');
    if(form) form.reset();

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const step0 = document.getElementById('step-0');
    if(step0) step0.classList.add('active');
}

// --- EXPONER FUNCIONES GLOBALES ---
window.copiarZelle = copiarZelle;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.nextStep = nextStep;
window.iniciarConMonto = iniciarConMonto;