document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Features section animations
    const featuresSection = document.querySelector('.features');
    const featureCards = document.querySelectorAll('.feature-card');
    const glowSpheres = document.querySelectorAll('.glow-sphere');
    let scrollProgress = 0;

    // Particle System
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'feature-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        featuresSection.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 2;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        let opacity = 1;
        let scale = 1;
        let posX = x;
        let posY = y;

        function animateParticle() {
            if (opacity <= 0) {
                particle.remove();
                return;
            }

            opacity -= 0.02;
            scale -= 0.01;
            posX += dx;
            posY += dy;

            particle.style.opacity = opacity;
            particle.style.transform = `translate(${posX - x}px, ${posY - y}px) scale(${scale})`;
            requestAnimationFrame(animateParticle);
        }

        requestAnimationFrame(animateParticle);
    }

    // Mouse trail effect
    featuresSection.addEventListener('mousemove', (e) => {
        const rect = featuresSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (Math.random() < 0.3) {
            createParticle(x, y);
        }

        // Move glow spheres
        glowSpheres.forEach((sphere, index) => {
            const offsetX = (x - rect.width / 2) * 0.05;
            const offsetY = (y - rect.height / 2) * 0.05;
            sphere.style.transform = `translate(${offsetX * (index + 1)}px, ${offsetY * (index + 1)}px)`;
        });
    });

    // Scroll-based animations
    window.addEventListener('scroll', () => {
        const rect = featuresSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
            scrollProgress = 1 - (sectionTop / windowHeight);
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            // Animate feature cards
            featureCards.forEach((card, index) => {
                const delay = index * 0.1;
                const scale = 0.95 + (scrollProgress * 0.05);
                const translateY = (1 - scrollProgress) * 50;
                const opacity = 0.5 + (scrollProgress * 0.5);

                card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                card.style.opacity = opacity;
            });

            // Animate cyber grid
            const cyberGrid = document.querySelector('.cyber-grid');
            const rotateX = 60 - (scrollProgress * 20);
            const translateZ = scrollProgress * 100;
            cyberGrid.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
        }
    });


    // Parallax effect for floating cards
    const cards = document.querySelectorAll('.floating-card');
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        cards.forEach((card, index) => {
            const depth = (index + 1) * 20;
            const moveX = mouseX * depth;
            const moveY = mouseY * depth;
            card.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });


    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .step').forEach(element => {
        observer.observe(element);
    });
});