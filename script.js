document.addEventListener('DOMContentLoaded', () => {
    
    const toggleSwitch = document.getElementById('notificationToggle');
    const notificationsContainer = document.getElementById('notificationsContainer');
    let notifications = [];
    let notificationInterval;
    let isActive = true;

    // Устанавливаем z-index контейнеру уведомлений выше чем у переключателя
    notificationsContainer.style.zIndex = "1000"; // Высокое значение z-index для контейнера

    // Function to get visual viewport height (dvh equivalent)
    function getViewportHeight() {
        return window.innerHeight;
    }

    // App data for random notifications
    const apps = [
        {
            name: 'Instagram',
            icon: 'instagram-icon',
            messages: [
                'liked your photo.',
                'started following you.',
                'commented on your post: "Amazing! 🔥"',
                'mentioned you in their story.',
                'sent you a message.',
                'sent you a reel.',
                'is now following you and 3 others.',
                'commented: "Love this! 💕"',
                'wants to tag you in a post.',
                'is going live now!',
                'shared a post: "Check this out"',
                'replied to your comment: "Thanks!"'
            ]
        },
        {
            name: 'TikTok',
            icon: 'tiktok-icon',
            messages: [
                'Your video is trending!',
                'liked your comment.',
                'replied to your comment.',
                'mentioned you in a video.',
                'New follower alert!',
                'started a LIVE video.',
                'shared your video.',
                'added your sound to their video.',
                'duetted with you!',
                'Your video went viral! 10K views',
                'posted a new video.',
                'commented: "This is everything 😂"'
            ]
        },
        {
            name: 'Facebook',
            icon: 'facebook-icon',
            messages: [
                'tagged you in a post.',
                'commented on your status.',
                'sent you a friend request.',
                'invited you to an event.',
                'went live: "Check out my stream!"',
                'shared a memory with you.',
                'reacted to your photo.',
                'sent you a message.',
                'commented on a post you\'re tagged in.',
                'added a new photo.',
                'wants you to like their page.',
                'is nearby.'
            ]
        }
    ];

    // Names for random notification generation
    const names = [
        'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 
        'Jackson', 'Sophia', 'Lucas', 'Isabella', 'Aiden',
        'Mia', 'Elijah', 'Harper', 'Ethan', 'Amelia',
        'Alex', 'Sofia', 'David', 'Zoe', 'James',
        'Lily', 'Benjamin', 'Charlotte', 'Daniel', 'Grace',
        'Matthew', 'Emily', 'Michael', 'Abigail', 'Jacob'
    ];

    // Random time strings
    const times = [
        'now', '1m ago', '2m ago', '5m ago', 'just now', 
        '3m ago', '1m', '30s ago', 'just now', '4m ago'
    ];

    // Create and add a notification
    function createNotification() {
        if (!isActive) return;
        
        const app = apps[Math.floor(Math.random() * apps.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const message = app.messages[Math.floor(Math.random() * app.messages.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        // Определяем ширину экрана и рассчитываем зону размещения
        const screenWidth = window.innerWidth;
        
        // Более равномерное распределение по экрану
        // Делим экран на 5 секторов и выбираем случайную позицию внутри следующего сектора
        const sectorCount = 5;
        const sectorWidth = screenWidth / sectorCount;
        
        // Определяем, какой сектор использовать для следующего уведомления
        // Используем статическую переменную для отслеживания последнего использованного сектора
        createNotification.lastSector = (createNotification.lastSector || 0) + 1;
        if (createNotification.lastSector >= sectorCount) {
            createNotification.lastSector = 0;
        }
        
        // Вычисляем случайную позицию в пределах текущего сектора
        // Позволяем выходить за края экрана только на 10px
        const sectorStart = createNotification.lastSector * sectorWidth;
        const notificationWidth = 300; // Примерная ширина уведомления
        const minX = sectorStart - 10; // Разрешаем выход за экран на 10px
        const maxX = sectorStart + sectorWidth - (notificationWidth - 10); // Разрешаем выход за экран на 10px
        const randomX = minX + Math.random() * (maxX - minX);
        
        // Генерируем случайное начальное положение по высоте
        const viewportHeight = getViewportHeight();
        const safeZoneHeight = viewportHeight - 20; // Account for 20px bottom margin
        const randomY = Math.random() * (safeZoneHeight * 0.3); // Keep in top 30% of safe zone
        
        // Random initial rotation
        const initialRotation = Math.random() * 10 - 5; // -5 to 5 degrees
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        notification.innerHTML = `
            <div class="notification-icon ${app.icon}"></div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-app">${app.name}</div>
                    <div class="notification-time">${time}</div>
                </div>
                <div class="notification-message"><strong>${name}</strong> ${message}</div>
            </div>
        `;
        
        // Set initial position with absolute positioning
        notification.style.left = randomX + 'px';
        notification.style.top = randomY + 'px';
        notification.style.transform = `rotate(${initialRotation}deg)`;
        notification.style.opacity = '0';
        notification.style.scale = '0.5';
        
        notificationsContainer.appendChild(notification);
        
        // Get actual dimensions after rendering
        const notificationHeight = notification.offsetHeight;
        
        // Remove if it won't fit in the safe zone
        const maxSafeHeight = safeZoneHeight * 0.8;
        if (notificationHeight > maxSafeHeight) {
            notification.remove();
            return;
        }
        
        notifications.push(notification);

        // Удаляем создание эффекта появления с частицами
        // createAppearEffect(randomX + notification.offsetWidth/2, randomY + notification.offsetHeight/2);
        
        // Animate the notification with Physics2D
        animateNotification(notification, randomX, randomY, initialRotation, notificationHeight, safeZoneHeight);
    }

    // Animate notification with Physics2D
    function animateNotification(notification, x, y, rotation, notificationHeight, safeZoneHeight) {
        // Точная позиция "пола" с учетом размера уведомления
        const floor = safeZoneHeight - notificationHeight; 
        
        // Создаем анимацию появления
        const tl = gsap.timeline();
        
        // Начальное состояние - невидимый и уменьшенный
        tl.set(notification, { 
            scale: 0.5,
            opacity: 0,
        });
        
        // Анимируем появление с эффектом пружины
        tl.to(notification, { 
            scale: 1,
            opacity: 1, 
            duration: 0.3,
            ease: "back.out(1.7)"
        });
        
        // После появления анимируем падение
        tl.call(() => {
            // Получаем стартовые позиции
            const startTop = parseFloat(notification.style.top);
            
            // Случайное смещение по X для разнообразия движения
            const xVariation = (Math.random() * 60) - 30; // -30 to 30px
            
            // Случайное вращение
            const targetRotation = rotation + (Math.random() * 20 - 10); // -10 до +10 градусов
            
            // Рассчитываем точную позицию для остановки у пола
            const finalY = floor - startTop;
            
            // Вместо Physics2D используем обычную анимацию с нужным easing
            // для полного контроля над конечной позицией
            gsap.to(notification, {
                y: finalY,
                x: xVariation,
                rotation: targetRotation,
                duration: 1 + Math.random() * 0.5, // Более короткая и предсказуемая длительность
                ease: "power2.in", // Больше ускорения к концу - имитация гравитации
                onComplete: function() {
                    // После приземления сразу проверяем столкновения
                    handleCollisions(notification);
                }
            });
        });
    }

    // Обработка столкновений для стопки физических объектов
    function handleCollisions(notification) {
        const viewportHeight = getViewportHeight();
        const viewportWidth = window.innerWidth;
        const safeBottom = viewportHeight - 10; // 10px запас снизу
        
        // Сначала проверяем, не выходит ли уведомление за нижнюю границу экрана
        const rect = notification.getBoundingClientRect();
        if (rect.bottom > safeBottom) {
            const excessHeight = rect.bottom - safeBottom;
            const currentY = gsap.getProperty(notification, "y") || 0;
            
            // Корректируем позицию без анимации для мгновенного эффекта
            gsap.set(notification, {
                y: currentY - excessHeight
            });
        }
        
        // Проверяем боковые границы - разрешаем выход только на 10px
        
        // Проверка левого края
        if (rect.left < -10) {
            const currentX = gsap.getProperty(notification, "x") || 0;
            const adjustment = -10 - rect.left; // Оставляем только 10px за границей
            gsap.set(notification, {
                x: currentX + adjustment
            });
        }
        
        // Проверка правого края
        if (rect.right > viewportWidth + 10) {
            const currentX = gsap.getProperty(notification, "x") || 0;
            const adjustment = viewportWidth + 10 - rect.right; // Оставляем только 10px за границей
            gsap.set(notification, {
                x: currentX + adjustment
            });
        }
        
        // Получаем все уведомления, кроме текущего
        const otherNotifications = notifications.filter(n => n !== notification);
        
        // Проверяем наложения с другими уведомлениями
        let hasOverlap = false;
        
        for (const other of otherNotifications) {
            const otherRect = other.getBoundingClientRect();
            
            // Проверяем горизонтальное перекрытие
            if (
                rect.right > otherRect.left + 20 &&
                rect.left < otherRect.right - 20
            ) {
                // Проверяем вертикальное перекрытие - только если уведомления близко друг к другу по Y
                if (Math.abs(rect.bottom - otherRect.top) < 30 || // Наше уведомление сверху
                    Math.abs(rect.top - otherRect.bottom) < 30) { // Наше уведомление снизу
                    
                    hasOverlap = true;
                    
                    // Поднимаем наше уведомление над другим
                    const liftAmount = otherRect.height * 0.7; // Поднимаем на 70% высоты объекта
                    
                    // Рассчитываем новую позицию Y
                    const currentY = gsap.getProperty(notification, "y") || 0;
                    const newY = currentY - liftAmount;
                    
                    // Небольшое смещение по X для эффекта стопки
                    const currentX = gsap.getProperty(notification, "x") || 0;
                    const xShift = (Math.random() * 20) - 10; // -10 до +10px
                    
                    // Анимируем подъем без использования эффектов отскока
                    gsap.to(notification, {
                        y: newY,
                        x: currentX + xShift,
                        duration: 0.2,
                        ease: "power1.out",
                        onComplete: () => {
                            // Небольшой поворот для естественности
                            gsap.to(notification, {
                                rotation: `+=${(Math.random() * 5) - 2.5}`, // Меньше поворот ±2.5°
                                duration: 0.1
                            });
                            
                            // Проверяем границы еще раз
                            const updatedRect = notification.getBoundingClientRect();
                            if (updatedRect.bottom > safeBottom) {
                                const adjustY = updatedRect.bottom - safeBottom;
                                gsap.set(notification, {
                                    y: gsap.getProperty(notification, "y") - adjustY
                                });
                            }
                        }
                    });
                    
                    break;
                }
            }
        }
    }

    // Для совместимости с остальным кодом
    function checkCollisions(notification) {
        handleCollisions(notification);
    }

    // Rearrange existing notifications to prevent overlaps
    function rearrangeNotifications() {
        // В нашем новом подходе это не требуется,
        // т.к. каждое уведомление само заботится о своей позиции через checkCollisions
    }

    // Helper function to calculate distance to screen edge in a given direction
    function getDistanceToScreenEdge(x, y, angle, screenWidth, screenHeight) {
        // Direction vector
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Calculate distances to each edge
        let distX, distY;
        
        if (dx > 0) {
            distX = (screenWidth - x) / dx;
        } else if (dx < 0) {
            distX = x / -dx;
        } else {
            distX = Infinity;
        }
        
        if (dy > 0) {
            distY = (screenHeight - y) / dy;
        } else if (dy < 0) {
            distY = y / -dy;
        } else {
            distY = Infinity;
        }
        
        // Return the smaller of the two distances
        return Math.min(distX, distY);
    }

    // Handle toggle switch with enhanced effects
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            // Toggle is ON - clear notifications with enhanced "burst" effect
            isActive = false;
            clearInterval(notificationInterval);
            
            // Create explosion particles in the center of the screen
            createExplosionEffect();
            
            // Make all notifications burst simultaneously
            notifications.forEach((notification) => {
                const notificationRect = notification.getBoundingClientRect();
                const centerX = notificationRect.left + notificationRect.width / 2;
                const centerY = notificationRect.top + notificationRect.height / 2;
                
                // Create a burst of particles at the notification's position
                createBurstParticles(centerX, centerY, 15 + Math.floor(Math.random() * 10));
            });
            
            // Animate all notifications bursting simultaneously
            gsap.to(notifications, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(2)",
                stagger: 0, // Одновременное исчезновение
                onComplete: () => {
                    // Удаляем все уведомления
                    notifications.forEach(notification => notification.remove());
                    notifications = [];
                }
            });
        } else {
            // Toggle is OFF - start generating notifications
            isActive = true;
            startNotifications();
        }
    });

    // Create an explosion effect in the center
    function createExplosionEffect() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const particleCount = 40 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and opacity
            const size = Math.random() * 6 + 2; // 2-8px
            const opacity = Math.random() * 0.8 + 0.2; // 0.2-1
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            document.querySelector('.container').appendChild(particle);
            
            // Animate particles outward in all directions
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 50 + Math.random() * 350;
            const duration = 1 + Math.random() * 1.5;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    // Create particles for a burst effect when a notification disappears
    function createBurstParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and opacity
            const size = Math.random() * 6 + 2; // 2-8px
            const opacity = Math.random() * 0.8 + 0.2; // 0.2-1
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            document.querySelector('.container').appendChild(particle);
            
            // Animate particles outward in a star pattern
            const angle = (i / count) * Math.PI * 2;
            const distance = 30 + Math.random() * 70;
            const duration = 0.5 + Math.random() * 0.7;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    // Start generating notifications
    function startNotifications() {
        // Generate first few notifications immediately
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createNotification(), i * 200);
        }
        
        // Generate notifications periodically without checking count limit
        notificationInterval = setInterval(() => {
            // Keep creating notifications indefinitely
            createNotification();
        }, 700);
    }

    // Update on resize
    window.addEventListener('resize', () => {
        const viewportHeight = getViewportHeight();
        const safeBottom = viewportHeight - 10; // 10px запас
        
        // Update existing notifications to respect new viewport height
        notifications.forEach(notification => {
            const rect = notification.getBoundingClientRect();
            
            // Если уведомление выходит за границы экрана
            if (rect.bottom > safeBottom) {
                const adjustY = rect.bottom - safeBottom;
                const currentY = gsap.getProperty(notification, "y") || 0;
                
                // Устанавливаем новую позицию без анимации
                gsap.set(notification, {
                    y: currentY - adjustY
                });
            }
        });
    });

    // Start generating notifications when page loads
    startNotifications();
}); 