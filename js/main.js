// @ts-nocheck
/* ============================================
   MAIN JAVASCRIPT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initMagneticBubbles();
    initContactForm();
});

function initMagneticBubbles() {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const orb3 = document.querySelector('.orb-3');

    if (!orb1 || !orb2 || !orb3) return;

    let mouseX = 0, mouseY = 0;
    let current1X = 0, current1Y = 0;
    let current2X = 0, current2Y = 0;
    let current3X = 0, current3Y = 0;

    const factor1 = 0.03;
    const factor2 = -0.015;
    const factor3 = 0.02;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animateOrbs() {
        const wx = window.innerWidth;
        const wy = window.innerHeight;

        current1X += (mouseX * wx * factor1 - current1X) * 0.05;
        current1Y += (mouseY * wy * factor1 - current1Y) * 0.05;
        current2X += (mouseX * wx * factor2 - current2X) * 0.05;
        current2Y += (mouseY * wy * factor2 - current2Y) * 0.05;
        current3X += (mouseX * wx * factor3 - current3X) * 0.05;
        current3Y += (mouseY * wy * factor3 - current3Y) * 0.05;

        orb1.style.transform = `translate(${current1X}px, ${current1Y}px)`;
        orb2.style.transform = `translate(${current2X}px, ${current2Y}px)`;
        orb3.style.transform = `translate(${current3X}px, ${current3Y}px)`;

        requestAnimationFrame(animateOrbs);
    }

    animateOrbs();
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusContainer = document.getElementById('form-status');

    if (!form || !statusContainer) return;

    function showFormStatus(msgId, type) {
        const key = 'msg' + msgId
            .split('-')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('');
        const message = statusContainer.dataset[key];
        statusContainer.textContent = message || 'Ocurrio un error inesperado.';
        statusContainer.className = 'form-status ' + type;
        statusContainer.classList.remove('sr-only');
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        form.classList.remove('has-error');
        statusContainer.className = 'form-status sr-only';

        if (!name || !email || !message) {
            showFormStatus('error-fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showFormStatus('error-email', 'error');
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showFormStatus('success', 'success');
            form.reset();
        } catch (error) {
            showFormStatus('error-send', 'error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}