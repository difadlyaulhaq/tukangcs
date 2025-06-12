<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TukangCS - AI Customer Service Chatbot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* Animations */
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }

        @keyframes slideInLeft {
            from { transform: translateX(-100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        /* Reveal animations */
        .reveal-element, .reveal-left, .reveal-right {
            opacity: 0;
            transition: all 0.8s ease;
        }

        .reveal-left.visible {
            animation: slideInLeft 0.8s ease forwards;
        }

        .reveal-right.visible {
            animation: slideInRight 0.8s ease forwards;
        }

        .reveal-element.visible {
            animation: slideInUp 0.8s ease forwards;
        }

        .stagger-1 { animation-delay: 0.2s; }
        .stagger-2 { animation-delay: 0.4s; }
        .stagger-3 { animation-delay: 0.6s; }

        /* Utility classes */
        .min-h-screen { min-height: 100vh; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .overflow-hidden { overflow: hidden; }
        .max-w-6xl { max-width: 72rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .flex { display: flex; }
        .justify-center { justify-content: center; }
        .items-center { align-items: center; }
        .gap-12 { gap: 3rem; }
        .gap-8 { gap: 2rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-16 { margin-bottom: 4rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .space-y-4 > * + * { margin-top: 1rem; }

        /* Grid system */
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: 1fr; }
        .md-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .lg-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }

        /* Typography */
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .font-bold { font-weight: 700; }
        .font-black { font-weight: 900; }
        .leading-tight { line-height: 1.25; }
        .leading-relaxed { line-height: 1.625; }

        /* Colors */
        .text-white { color: white; }
        .text-gray-300 { color: #d1d5db; }
        .bg-white { background-color: white; }
        .bg-green-500 { background-color: #10b981; }

        /* Background gradients */
        .bg-gradient-to-br {
            background: linear-gradient(to bottom right, #111827, #581c87, #1e3a8a);
        }

        .bg-gradient-to-r {
            background: linear-gradient(to right, #9333ea, #2563eb);
        }

        .text-transparent {
            color: transparent;
        }

        .bg-clip-text {
            -webkit-background-clip: text;
            background-clip: text;
        }

        /* Floating animation */
        .floating {
            animation: floating 4s ease-in-out infinite;
        }

        .bounce-gentle {
            animation: bounce-gentle 3s ease-in-out infinite;
        }

        /* Glass effect */
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 1rem;
        }

        /* Button styles */
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: #667eea;
            padding: 16px 32px;
            border: 2px solid #667eea;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        /* Character illustrations */
        .character-sitting {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 120px;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .character-working {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 120px;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .character-sitting img,
        .character-working img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: inherit;
        }

        .text-svg {
            max-width: 100%;
            height: auto;
        }

        /* Background decorations */
        .bg-decoration {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            animation: floating 6s ease-in-out infinite;
        }

        /* Feature cards */
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
        }

        /* Checkmark list */
        .checkmark-list {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .checkmark {
            width: 24px;
            height: 24px;
            background-color: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            flex-shrink: 0;
        }

        /* Responsive Design */
        @media (min-width: 768px) {
            .md-grid-cols-3 {
                grid-template-columns: repeat(3, 1fr);
            }
            .md-text-5xl {
                font-size: 3rem;
                line-height: 1;
            }
        }

        @media (min-width: 1024px) {
            .lg-grid-cols-2 {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            /* Hide character images on mobile */
            .character-sitting, 
            .character-working {
                display: none !important;
            }
            
            /* Adjust grid layout for mobile */
            .lg-grid-cols-2 {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
            }
            
            .md-grid-cols-3 {
                grid-template-columns: 1fr !important;
                gap: 1.5rem !important;
            }
            
            /* Center content on mobile */
            .reveal-left, 
            .reveal-right {
                text-align: center;
            }
            
            /* Adjust text sizes for mobile */
            .text-4xl,
            .md-text-5xl {
                font-size: 2rem !important;
                line-height: 1.2 !important;
            }
            
            .text-xl {
                font-size: 1.125rem !important;
            }
            
            /* Stack buttons vertically on mobile */
            .flex-col-mobile {
                flex-direction: column !important;
            }
            
            .px-6 {
                padding-left: 1rem !important;
                padding-right: 1rem !important;
            }
            
            .py-20 {
                padding-top: 3rem !important;
                padding-bottom: 3rem !important;
            }
        }

        @media (max-width: 480px) {
            .text-4xl,
            .md-text-5xl {
                font-size: 1.75rem !important;
            }
            
            .text-xl {
                font-size: 1rem !important;
            }
        }

        /* Animated stars */
        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        .star-1 {
            top: 20%;
            left: 10%;
            width: 8px;
            height: 8px;
        }

        .star-2 {
            top: 40%;
            right: 20%;
            width: 6px;
            height: 6px;
            animation-delay: -1s;
        }

        .star-3 {
            bottom: 32%;
            left: 25%;
            width: 4px;
            height: 4px;
            animation-delay: -2s;
        }
    </style>
</head>
<body>
    <!-- First Section - AI Powered Customer Service -->
    <section class="min-h-screen bg-gradient-to-br py-20 px-6 relative overflow-hidden">
        <!-- Background decorations -->
        <div class="bg-decoration" style="top: 10%; left: 10%; width: 80px; height: 80px; background: white;"></div>
        <div class="bg-decoration" style="top: 70%; right: 15%; width: 60px; height: 60px; background: white; animation-delay: -2s;"></div>
        <div class="bg-decoration" style="top: 40%; left: 20%; width: 40px; height: 40px; background: white; animation-delay: -4s;"></div>
        <div class="bg-decoration" style="top: 15%; right: 10%; width: 100px; height: 100px; background: linear-gradient(135deg, #667eea, #764ba2);"></div>
        <div class="bg-decoration" style="bottom: 20%; left: 15%; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6B6B, #4ECDC4); animation-delay: -3s;"></div>
        
        <!-- Animated stars -->
        <div class="star star-1"></div>
        <div class="star star-2"></div>
        <div class="star star-3"></div>
        
        <div class="max-w-6xl mx-auto">
            <!-- Hero Section -->
            <div class="grid lg-grid-cols-2 gap-12 items-center">
                <!-- Left side - Text -->
                <div class="reveal-left">
                    <h1 class="text-4xl md-text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-8 leading-tight">
                        AI-POWERED CUSTOMER SERVICE CHATBOT
                    </h1>
                    <p class="text-xl text-gray-300 mb-8 leading-relaxed">
                        Transformasi digital untuk layanan pelanggan yang lebih cerdas dan responsif
                    </p>
                    <div class="flex flex-col-mobile gap-4">
                        <button class="btn-primary">
                            🚀 Mulai Sekarang
                        </button>
                        <button class="btn-secondary">
                            📖 Pelajari Lebih Lanjut
                        </button>
                    </div>
                </div>
                
                <!-- Right side - Character -->
                <div class="reveal-right relative flex justify-center">
                    <div class="character-sitting floating">
                        🤖
                    </div>
                </div>
            </div>
            
            <!-- Second Section -->
            <div style="margin-top: 8rem;">
                <div class="grid lg-grid-cols-2 gap-12 items-center">
                    <!-- Left side - Character working -->
                    <div class="reveal-left relative flex justify-center">
                        <div class="character-working floating">
                             👩‍💻
                        </div>
                    </div>
                    
                    <!-- Right side - Text content -->
                    <div class="reveal-right">
                        <h2 class="text-4xl md-text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-8 leading-tight">
                            REVOLUSI LAYANAN PELANGGAN ANDA DENGAN TUKANGCS
                        </h2>
                        
                        <p class="text-xl text-white mb-8 leading-relaxed">
                            Chatbot cerdas yang mengerti bisnis Anda. Otomatis, responsif, dan siap melayani pelanggan 24/7 di semua platform komunikasi.
                        </p>
                        
                        <!-- Features list -->
                        <div class="mb-8 space-y-4">
                            <div class="checkmark-list reveal-element stagger-1">
                                <div class="checkmark">✓</div>
                                <span class="text-white">Integrasi multi-platform (WhatsApp, Telegram, Website)</span>
                            </div>
                            <div class="checkmark-list reveal-element stagger-2">
                                <div class="checkmark">✓</div>
                                <span class="text-white">AI yang belajar dari bisnis Anda</span>
                            </div>
                            <div class="checkmark-list reveal-element stagger-3">
                                <div class="checkmark">✓</div>
                                <span class="text-white">Dashboard analytics dan laporan real-time</span>
                            </div>
                        </div>
                        
                        <!-- CTA Buttons -->
                        <div class="flex flex-col-mobile gap-4">
                            <button class="btn-primary reveal-element stagger-1">
                                🚀 Lihat Demo
                            </button>
                            <button class="btn-secondary reveal-element stagger-2">
                                📅 Jadwalkan Konsultasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Features Section -->
            <div style="margin-top: 8rem;">
                <div class="text-center mb-16">
                    <div class="reveal-element">
                        <h2 class="text-4xl md-text-5xl font-bold text-white mb-8">
                            Fitur Unggulan TukangCS
                        </h2>
                        <p class="text-xl text-gray-300">
                            Solusi lengkap untuk customer service yang lebih efisien dan profesional
                        </p>
                    </div>
                </div>
                
                <div class="grid md-grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div class="feature-card reveal-element stagger-1">
                        <div class="text-6xl mb-6">🤖</div>
                        <h3 class="text-2xl font-bold text-white mb-4">AI Cerdas</h3>
                        <p class="text-gray-300">Chatbot yang memahami konteks percakapan dan memberikan respon yang relevan</p>
                    </div>
                    
                    <!-- Feature 2 -->
                    <div class="feature-card reveal-element stagger-2">
                        <div class="text-6xl mb-6">📱</div>
                        <h3 class="text-2xl font-bold text-white mb-4">Multi Platform</h3>
                        <p class="text-gray-300">Satu dashboard untuk kelola semua channel komunikasi pelanggan</p>
                    </div>
                    
                    <!-- Feature 3 -->
                    <div class="feature-card reveal-element stagger-3">
                        <div class="text-6xl mb-6">📊</div>
                        <h3 class="text-2xl font-bold text-white mb-4">Analytics</h3>
                        <p class="text-gray-300">Laporan detail performa customer service dan tingkat kepuasan pelanggan</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all reveal elements
        document.addEventListener('DOMContentLoaded', () => {
            const revealElements = document.querySelectorAll('.reveal-element, .reveal-left, .reveal-right');
            revealElements.forEach(el => observer.observe(el));
        });

        // Enhanced button interactions
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Add ripple effect
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
                
                // Demo actions
                if (button.textContent && button.textContent.includes('Demo')) {
                    alert('🚀 Demo akan segera dimulai! Fitur ini akan menampilkan cara kerja TukangCS.');
                } else if (button.textContent && button.textContent.includes('Konsultasi')) {
                    alert('📅 Terima kasih! Tim kami akan menghubungi Anda untuk jadwal konsultasi gratis.');
                } else if (button.textContent && button.textContent.includes('Mulai')) {
                    alert('🎉 Selamat datang di TukangCS! Mari mulai perjalanan transformasi digital Anda.');
                } else if (button.textContent && button.textContent.includes('Pelajari')) {
                    alert('📚 Dokumentasi lengkap akan segera tersedia untuk Anda pelajari.');
                }
            });
        });

        // Parallax effect for background elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.bg-decoration');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    </script>
</body>
</html>