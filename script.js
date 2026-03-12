// Data for the artworks
const artworks = [
    {
        id: "art-1",
        src: "imagenes/Gemini_Generated_Image_289usu289usu289u.png",
        title: "Abstracción Primaria",
        legend: "Un torrente de rojo carmesí rompiendo la calma. Representa la irrupción del pensamiento espontáneo impulsivo frente al cálculo lógico y racional. La obra no se planeó; sucedió."
    },
    {
        id: "art-2",
        src: "imagenes/Gemini_Generated_Image_4216f24216f24216.png",
        title: "Fluidez Cautiva",
        legend: "La tensión constante entre lo líquido y lo sólido. Una manifestación estructurada y geométrica del caos, encapsulando emociones desbordantes dentro de un marco de control estricto de la mente."
    },
    {
        id: "art-3",
        src: "imagenes/Gemini_Generated_Image_5av0tx5av0tx5av0.png",
        title: "Vestigios de Luz",
        legend: "Pinceladas vibrantes e inesperadas que rasgan la densidad de la oscuridad. Es el esfuerzo cognitivo puro tratando de emerger del letargo profundo cerebral. Una celebración sincera del despertar."
    },
    {
        id: "art-4",
        src: "imagenes/Gemini_Generated_Image_6kuggu6kuggu6kug.png",
        title: "Estructura Rota",
        legend: "El colapso progresivo de expectativas. Líneas rectas convergiendo sutilmente en espirales improbables que demuestran la belleza del fracaso sistemático en la pintura técnica."
    },
    {
        id: "art-5",
        src: "imagenes/Gemini_Generated_Image_8731gv8731gv8731.png",
        title: "Materia Silenciosa",
        legend: "Texturas pesadas que simulan minerales, rocas y arena milenaria. Una oda a lo tangible en una era puramente digital. Invoca nuestro arraigo primigenio e innegable a la tierra."
    },
    {
        id: "art-6",
        src: "imagenes/Gemini_Generated_Image_8vbb7h8vbb7h8vbb.png",
        title: "Convergencia Letal",
        legend: "El clímax y desenlace misterioso de la serie principal de la galería. Todos los colores intensos se anulan mutuamente, dejando tras de sí una paleta deliberadamente sombría y elocuente."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Basic DOM elements
    const galleryGrid = document.getElementById('gallery-grid');
    const bubblesContainer = document.getElementById('bubbles-container');
    const navbar = document.querySelector('.navbar');
    const heroBgAnim = document.getElementById('hero-bg-anim');
    
    // Arrays to hold references for the custom animation loop
    const bubbles = [];
    const placeholders = [];
    const infoCards = [];
    
    // 1. Build the DOM structures dynamically
    artworks.forEach((art, index) => {
        // --- Setup Gallery Wrapper ---
        const wrapper = document.createElement('div');
        wrapper.className = 'artwork-wrapper';
        
        // Target Placeholder (Where the bubble will land)
        const placeholder = document.createElement('div');
        placeholder.className = 'artwork-placeholder';
        
        // Info Card (The text description)
        const info = document.createElement('article');
        info.className = 'artwork-card-info';
        info.innerHTML = `
            <div class="artwork-info-content">
                <h3>${art.title}</h3>
                <p>${art.legend}</p>
            </div>
        `;
        
        wrapper.appendChild(placeholder);
        wrapper.appendChild(info);
        galleryGrid.appendChild(wrapper);
        
        placeholders.push(placeholder);
        infoCards.push(info);
        
        // --- Setup Floating Bubble ---
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const img = document.createElement('img');
        img.src = art.src;
        img.alt = art.title;
        img.draggable = false; // Disable native drag
        
        bubble.appendChild(img);
        bubblesContainer.appendChild(bubble);
        
        // Initialize state logic for the bubble
        bubbles.push({
            el: bubble,
            id: art.id,
            angle: (index / artworks.length) * Math.PI * 2, // Evenly spaced orbit
            speed: 0.001 + Math.random() * 0.0015,
            offsetX: Math.random() * 30, // For horizontal drift
            offsetY: Math.random() * 30, // For vertical drift
            direction: Math.random() > 0.5 ? 1 : -1
        });
    });

    // 2. Core Physics Helper Functions
    // Calculates how far along the "docking phase" a placeholder is.
    function calculateDockProgress(placeholderRect, windowHeight) {
        // Start docking when placeholder is 90% down the viewport
        const startDock = windowHeight * 0.9;
        // Finish docking exactly when placeholder reaches top 30% of viewport
        const endDock = windowHeight * 0.3;
        
        let progress = (startDock - placeholderRect.top) / (startDock - endDock);
        return Math.max(0, Math.min(1, progress));
    }

    // Smooth step easing Function
    function easeInOutQuad(t) { 
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
    }

    // 3. Render Loop (Vanilla Custom WebGL-like loop)
    function render(time) {
        const scrollY = window.scrollY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // UI Scroll Updates
        if (scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        // Hero Background Scroll "Gesture" (Zoom & Blur)
        if (heroBgAnim) {
            let zoom = 1 + scrollY * 0.0008; 
            let blur = scrollY * 0.015;     
            let brightness = 0.5 - (scrollY * 0.0005); 
            if (brightness < 0.1) brightness = 0.1;
            
            heroBgAnim.style.transform = `scale(${Math.min(zoom, 1.8)})`;
            heroBgAnim.style.filter = `brightness(${brightness}) blur(${Math.min(blur, 15)}px)`;
        }

        // Orbital Base Math Configurations
        const isMobile = windowWidth <= 768;
        const centerX = windowWidth / 2;
        // Adjust vertical center so bubbles move UP as you scroll past hero
        const heroCenterOffset = (windowHeight / 2) - scrollY; 
        const centerY = heroCenterOffset;
        
        const radiusX = isMobile ? windowWidth * 0.35 : windowWidth * 0.32;
        const radiusY = isMobile ? windowHeight * 0.25 : windowHeight * 0.3;
        const bubbleDefaultSize = isMobile ? 80 : 130;

        bubbles.forEach((bData, i) => {
            const placeholder = placeholders[i];
            const infoCard = infoCards[i];
            const rect = placeholder.getBoundingClientRect();
            
            // Step A: Calculate Floating Orbit Position
            bData.angle += bData.speed * bData.direction;
            
            // Add subtle sine sway logic for visual appeal
            const swayY = Math.sin(time * 0.001 + i) * bData.offsetY;
            const swayX = Math.cos(time * 0.0012 + i) * bData.offsetX;

            const orbitX = centerX + Math.cos(bData.angle) * radiusX - (bubbleDefaultSize/2) + swayX;
            const orbitY = centerY + Math.sin(bData.angle) * radiusY - (bubbleDefaultSize/2) + swayY;
            
            // Step B: Define target position (Gallery Placeholder)
            const targetX = rect.left;
            const targetY = rect.top;
            const targetWidth = rect.width;
            const targetHeight = rect.height;
            
            // Step C: Calculate Transition / Docking Progress
            let progress = calculateDockProgress(rect, windowHeight);
            let easeProg = easeInOutQuad(progress);
            
            // Extrapolate Current values between Orbit and Target
            const currentX = orbitX + (targetX - orbitX) * easeProg;
            const currentY = orbitY + (targetY - orbitY) * easeProg;
            
            const currentWidth = bubbleDefaultSize + (targetWidth - bubbleDefaultSize) * easeProg;
            const currentHeight = bubbleDefaultSize + (targetHeight - bubbleDefaultSize) * easeProg;
            
            // Morph border radius (50% circle -> 16px rounded rectangle)
            const currentRadius = 50 + (16 - 50) * Math.min(1, easeProg * 1.5);
            
            // Step D: Apply transform efficiently via translate3d
            bData.el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            bData.el.style.width = `${currentWidth}px`;
            bData.el.style.height = `${currentHeight}px`;
            
            // We use standard string interpolation for border-radius
            bData.el.style.borderRadius = easeProg === 1 ? '16px' : `${currentRadius}%`;
            
            // Visual States (opacity, text revelation)
            if (easeProg > 0.8) {
                bData.el.classList.add('docked');
                infoCard.classList.add('visible');
            } else {
                bData.el.classList.remove('docked');
                // Hide earlier to create anticipation
                if (easeProg < 0.5) infoCard.classList.remove('visible');
            }

        });

        // Loop execution forever on sync with browser refreshes
        requestAnimationFrame(render);
    }

    // Start Loop
    requestAnimationFrame(render);

    // 4. Subtle Intersectional Fade In for Biography
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = "opacity 1s, transform 1s ease-out";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    const bioElements = document.querySelectorAll('.bio-text, .bio-img');
    bioElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        observer.observe(el);
    });

});
