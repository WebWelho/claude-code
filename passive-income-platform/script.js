// UrakoitsijaHub – Platform script

// Sign-up form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        const service = signupForm.querySelector('select').value;
        if (!service) {
            alert('Valitse palvelu ennen rekisteröitymistä.');
            return;
        }
        // Simulate registration - in production connect to backend / Stripe
        const btn = signupForm.querySelector('button');
        btn.textContent = 'Rekisteröityminen...';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = '✓ Rekisteröity! Tarkista sähköpostisi.';
            btn.style.background = '#22c55e';
            signupForm.reset();
        }, 1500);
    });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Animate stats on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.step, .service-item, .price-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.step, .service-item, .price-card').forEach(el => {
    visibilityObserver.observe(el);
});
