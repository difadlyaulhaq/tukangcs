<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(108, 99, 255, 0.6); }
        }
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .floating { animation: float 6s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .gradient-bg {
            background: linear-gradient(-45deg, #6C63FF, #8B5FFF, #A855F7, #7C3AED);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
        }
        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift {
            transition: all 0.3s ease;
        }
        .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body class="font-sans">
    <section class="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 min-h-screen gradient-bg text-white relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full floating"></div>
        <div class="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-10 rounded-full floating" style="animation-delay: -2s;"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-5 rounded-full floating" style="animation-delay: -4s;"></div>
        
        <!-- Content Section -->
        <div class="max-w-xl mb-10 md:mb-0 z-10">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  TukangCs
                </span>
          </h1>
            <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                SMART CUSTOMER SERVICE 
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                    MADE SIMPLE
                </span>
            </h1>
            <p class="mb-4 text-xl text-gray-100">
                Omni-channel AI-powered customer support that connects all your channels in one place.
            </p>
            <p class="mb-8 text-base text-gray-200">
                Manage WhatsApp, Email, Live Chat, and Social Media conversations with intelligent automation and real-time insights.
            </p>
            
            <!-- Download Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
                <a href="#" class="glass-effect hover-lift px-6 py-3 rounded-xl inline-flex items-center justify-center group transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="mr-3">
                        <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5Z" fill="currentColor"/>
                        <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z" fill="currentColor"/>
                        <path d="M20.16 10.81C20.5 11.08 20.75 11.53 20.75 12C20.75 12.47 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z" fill="currentColor"/>
                        <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" fill="currentColor"/>
                    </svg>
                    <div class="text-left">
                        <div class="text-xs opacity-75">GET IT ON</div>
                        <div class="font-semibold">Google Play</div>
                    </div>
                </a>
                
                <a href="#" class="glass-effect hover-lift px-6 py-3 rounded-xl inline-flex items-center justify-center group transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="mr-3">
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.13997 6.91 8.85997 6.88C10.15 6.86 11.35 7.75 12.12 7.75C12.88 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.19 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
                    </svg>
                    <div class="text-left">
                        <div class="text-xs opacity-75">DOWNLOAD ON THE</div>
                        <div class="font-semibold">App Store</div>
                    </div>
                </a>
            </div>
        </div>
        
        <!-- Phone Mockup Section -->
        <div class="w-full md:w-[400px] z-10">
            <div class="relative floating pulse-glow">
                <!-- Phone Frame -->
                <div class="bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                    <div class="bg-black rounded-[2.5rem] p-1">
                        <div class="bg-gray-50 rounded-[2rem] aspect-[9/19] relative overflow-hidden">
                            <!-- Phone Screen Content -->
                            <div class="h-full flex flex-col text-gray-800">
                                <!-- Status Bar -->
                                <div class="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
                                    <div class="flex items-center gap-1">
                                        <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <div class="text-center font-medium">9:41</div>
                                    <div class="flex items-center gap-1">
                                        <div class="w-4 h-2 bg-green-500 rounded-sm"></div>
                                        <div class="w-1 h-2 bg-gray-400 rounded-sm"></div>
                                    </div>
                                </div>

                                <!-- Header -->
                                <div class="bg-white px-4 py-3 border-b border-gray-200">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-white">
                                                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <h1 class="font-bold text-lg">CS Dashboard</h1>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <span class="text-white text-xs font-bold">3</span>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                                                <path d="M18 8A6 6 0 0 0 6 8C6 7.2 6.8 5.68 7.77 4.86C8.77 4 10.2 3.5 12 3.5C13.8 3.5 15.23 4 16.23 4.86C17.2 5.68 18 7.2 18 8Z" stroke="currentColor" stroke-width="2"/>
                                                <path d="M19 19H5C5.56 19 6 18.56 6 18V8H18V18C18 18.56 18.44 19 19 19Z" stroke="currentColor" stroke-width="2"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <!-- Stats Cards -->
                                <div class="px-4 py-3 bg-gray-50">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <p class="text-xs text-gray-500">Active Chats</p>
                                                    <p class="text-lg font-bold text-blue-600">12</p>
                                                </div>
                                                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-blue-600">
                                                        <path d="M21 11.5C21.03 12.13 21.03 12.87 21 13.5C20.98 16.58 18.58 16.98 16.5 17H7.5C5.42 16.98 3.02 16.58 3 13.5C2.97 12.87 2.97 12.13 3 11.5C3.02 8.42 5.42 8.02 7.5 8H16.5C18.58 8.02 20.98 8.42 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                        <path d="M16 8V6C16 4.93 15.36 3.43 14.5 2.87C13.5 2.22 12.5 2.22 11.5 2.87C10.64 3.43 10 4.93 10 6V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <p class="text-xs text-gray-500">Pending</p>
                                                    <p class="text-lg font-bold text-orange-600">5</p>
                                                </div>
                                                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-orange-600">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                                        <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Channel Tabs -->
                                <div class="px-4 py-2 bg-white border-b border-gray-200">
                                    <div class="flex gap-1">
                                        <div class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488"/>
                                            </svg>
                                            WhatsApp
                                        </div>
                                        <div class="text-gray-600 px-3 py-1 text-xs flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                            </svg>
                                            Twitter
                                        </div>
                                        <div class="text-gray-600 px-3 py-1 text-xs flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                            Instagram
                                        </div>
                                    </div>
                                </div>

                                <!-- Conversation List -->
                                <div class="flex-1 overflow-y-auto">
                                    <div class="p-4 space-y-3">
                                        <!-- Active Conversation -->
                                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div class="flex items-start gap-3">
                                                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    WA
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-center justify-between">
                                                        <h3 class="font-medium text-sm text-gray-900">Sarah Wilson</h3>
                                                        <span class="text-xs text-gray-500">2m ago</span>
                                                    </div>
                                                    <p class="text-xs text-gray-600 mt-1">Hi, I need help with my order...</p>
                                                    <div class="flex items-center gap-2 mt-2">
                                                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                                                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">AI Suggested</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pending Conversation -->
                                        <div class="bg-white border border-gray-200 rounded-lg p-3">
                                            <div class="flex items-start gap-3">
                                                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    EM
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-center justify-between">
                                                        <h3 class="font-medium text-sm text-gray-900">John Doe</h3>
                                                        <span class="text-xs text-gray-500">15m ago</span>
                                                    </div>
                                                    <p class="text-xs text-gray-600 mt-1">Product inquiry about shipping...</p>
                                                    <div class="flex items-center gap-2 mt-2">
                                                        <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">Pending</span>
                                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Email</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Another Conversation -->
                                        <div class="bg-white border border-gray-200 rounded-lg p-3">
                                            <div class="flex items-start gap-3">
                                                <div class="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    IG
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-center justify-between">
                                                        <h3 class="font-medium text-sm text-gray-900">Maria Garcia</h3>
                                                        <span class="text-xs text-gray-500">1h ago</span>
                                                    </div>
                                                    <p class="text-xs text-gray-600 mt-1">Asking about return policy...</p>
                                                    <div class="flex items-center gap-2 mt-2">
                                                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Resolved</span>
                                                        <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">Instagram</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- AI Assistant Bar -->
                                <div class="bg-white border-t border-gray-200 p-3">
                                    <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                        <div class="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-white">
                                                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <span class="text-xs text-gray-600 flex-1">AI Assistant ready to help</span>
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>