// Полифилл для crypto.randomUUID если он не доступен
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('notificationToggle');
    const notificationsContainer = document.getElementById('notificationsContainer');
    const container = document.querySelector('.container');
    const toggleContainer = document.querySelector('.toggle-container');
    let notifications = [];
    let notificationInterval;
    let isActive = true;
    let nextZIndex = 100; // Start z-index for notifications higher than CSS default

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

    // Настройки уведомлений
    const NOTIFICATION_WIDTH = 380; // Ширина уведомления (px)
    const NOTIFICATION_GAP = 4; // Отступ между уведомлениями (px)
    const BOTTOM_MARGIN = 20; // Отступ от нижнего края экрана (px)
    const TOGGLE_MARGIN = 0; // Отступ, который нужно оставить до переключателя (0px - точно до границы)
    const MAX_VISIBLE_NOTIFICATIONS = 10; // Максимальное количество видимых уведомлений

    // Create and add a notification
    function createNotification() {
        if (!isActive) return;
        
        // Создаем контент уведомления
        const app = apps[Math.floor(Math.random() * apps.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const message = app.messages[Math.floor(Math.random() * app.messages.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        // Получаем размеры экрана
        const viewportWidth = window.innerWidth;
        const viewportHeight = getViewportHeight();
        
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.zIndex = nextZIndex++; // Assign and increment z-index
        
        // Удаляем поворот и устанавливаем прямой стиль (iOS-style)
        notification.style.borderRadius = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)';
        notification.style.width = `${NOTIFICATION_WIDTH}px`;
        notification.style.margin = '0 auto'; // Центрирование
        
        // Возвращаем оригинальную структуру HTML
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
        
        // Рассчитываем начальную позицию - снизу по центру экрана
        const centerX = (viewportWidth - NOTIFICATION_WIDTH) / 2;
        const startY = viewportHeight + 10; // Начинаем чуть ниже экрана для анимации входа
        
        // Устанавливаем начальные стили
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.top = `${startY}px`;
        notification.style.opacity = '0';
        
        // Добавляем на страницу
        notificationsContainer.appendChild(notification);
        
        // Получаем высоту после рендеринга
        const notificationHeight = notification.offsetHeight;
        
        // Добавляем в массив уведомлений
        notifications.push(notification);
        
        // Анимируем вход и смещаем существующие уведомления
        animateNotificationsStack(notification, notificationHeight);
        
        // Проверяем, не превышено ли максимальное количество уведомлений
        checkNotificationsLimit();
    }

    // Проверка на количество уведомлений и удаление лишних
    function checkNotificationsLimit() {
        if (notifications.length > MAX_VISIBLE_NOTIFICATIONS) {
            // Нужно убрать старые уведомления
            const notificationsToRemove = notifications.slice(0, notifications.length - MAX_VISIBLE_NOTIFICATIONS);
            
            // Анимируем исчезновение старых уведомлений
            notificationsToRemove.forEach((notification, index) => {
                gsap.to(notification, {
                    opacity: 0,
                    x: -100, // Исчезают влево без дополнительных эффектов
                    duration: 0.3,
                    delay: index * 0.05, // Небольшая задержка для эффекта каскада
                    ease: 'power2.in',
                    onComplete: () => {
                        // Удаляем уведомление из DOM
                        notification.remove();
                        // Удаляем из массива
                        const notificationIndex = notifications.indexOf(notification);
                        if (notificationIndex !== -1) {
                            notifications.splice(notificationIndex, 1);
                        }
                    }
                });
            });
        }
    }

    // Анимация стека уведомлений с упругостью
    function animateNotificationsStack(newNotification, newNotificationHeight) {
        const viewportHeight = getViewportHeight();
        
        // Обновляем позицию всего стека
        updateNotificationStack();
        
        // Улучшенная анимация входа с более выраженной пружиной
        gsap.fromTo(newNotification, 
            { y: 30, opacity: 0, scale: 0.95 },
            { 
                y: 0, 
                opacity: 1,
                scale: 1,
                duration: 0.5, 
                ease: 'elastic.out(1, 0.7)' // Более заметный упругий эффект
            }
        );
    }
    
    // Получение реальной позиции toggle
    function getTogglePosition() {
        const toggleRect = toggleContainer.getBoundingClientRect();
        return {
            top: toggleRect.top,
            bottom: toggleRect.bottom,
            height: toggleRect.height
        };
    }
    
    // Сохраняем начальную позицию toggle при загрузке страницы
    const initialTogglePosition = getTogglePosition();

    // Обновление позиций всего стека уведомлений
    function updateNotificationStack() {
        const viewportHeight = getViewportHeight();
        
        // Используем сохраненную позицию toggle вместо получения текущей
        const togglePos = initialTogglePosition;
        
        // Копируем и переворачиваем массив, чтобы обрабатывать с нижнего (последнего) к верхнему
        const notificationsReversed = [...notifications].reverse();
        
        let currentY = viewportHeight - BOTTOM_MARGIN;
        const fadeZoneSize = 2; // Размер зоны исчезновения (в высотах уведомления)
        
        // Рассчитываем безопасную верхнюю границу (не доходя до переключателя)
        const safeTopBoundary = togglePos.bottom + TOGGLE_MARGIN;
        
        // Сначала установим правильные z-index для эффекта "ухода за предыдущие"
        // Нижние уведомления должны иметь больший z-index чем верхние
        let currentZindex = 100 + notificationsReversed.length;
        
        notificationsReversed.forEach((notification, index) => {
            notification.style.zIndex = currentZindex--;
        });
        
        // Помечаем, было ли достигнуто максимальное смещение вверх
        let reachedTopLimit = false;
        
        // Обновляем позиции всех уведомлений в стеке
        notificationsReversed.forEach((notification, index) => {
            const notificationHeight = notification.offsetHeight;
            
            // Вычисляем новую позицию по Y (снизу вверх)
            currentY -= notificationHeight;
            
            // Если это не первое уведомление, добавляем отступ
            if (index > 0) {
                currentY -= NOTIFICATION_GAP;
            }
            
            // Если предыдущее уведомление достигло границы toggle, останавливаем стек
            // и делаем уведомление невидимым
            if (reachedTopLimit) {
                gsap.set(notification, { opacity: 0, scale: 0.8, z: -30 });
                return; // Пропускаем дальнейшие вычисления для этого уведомления
            }
            
            // Проверяем, не достигнет ли верхний край уведомления зоны toggle
            if (currentY < safeTopBoundary) {
                // Уведомление достигло границы toggle
                // Останавливаем его ровно на границе
                currentY = safeTopBoundary;
                
                // Отмечаем, что достигли верхней границы
                reachedTopLimit = true;
                
                // Анимируем эффект ухода назад
                gsap.to(notification, {
                    opacity: 0,
                    scale: 0.8,
                    z: -30,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                // Для видимых уведомлений устанавливаем полную непрозрачность
                gsap.to(notification, { 
                    opacity: 1, 
                    scale: 1,
                    z: 0,
                    duration: 0.3,
                    ease: 'power1.out'
                });
            }
            
            // Анимируем перемещение с легкой упругостью для следующего уведомления
            gsap.to(notification, {
                top: currentY,
                duration: 0.3,
                ease: index === 0 ? 'power2.out' : 'back.out(1.3)' // Усиливаем упругость
            });
        });
    }

    // Handle toggle switch with enhanced effects
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            // Toggle is ON - clear notifications
            isActive = false;
            clearInterval(notificationInterval);
            
            // Анимируем плавное исчезновение уведомлений вниз (оригинальный вариант)
            const notificationsToClear = [...notifications];
            
            gsap.to(notificationsToClear, {
                y: 100, // Возвращаем прежнее смещение вниз
                opacity: 0,
                duration: 0.4,
                stagger: 0.05, // Небольшая задержка между уведомлениями
                ease: "power2.in",
                onComplete: () => {
                    // Удаляем все уведомления
                    notificationsToClear.forEach(notification => notification.remove());
                    notifications = []; // Очищаем массив
                }
            });
        } else {
            // Toggle is OFF - start generating notifications
            isActive = true;
            
            // Reset z-index counter
            nextZIndex = 100;
            
            // Start generating new notifications
            startNotifications();
        }
    });

    // Start generating notifications
    function startNotifications() {
        // Generate notifications with a reasonable interval
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createNotification(), i * 700);
        }
        
        // Generate notifications periodically
        notificationInterval = setInterval(() => {
            if (notifications.length < 30) { // Увеличиваем лимит, так как теперь верхние удаляются
                createNotification();
            }
        }, 2000); // Более медленный интервал для лучшего восприятия
    }

    // Update on resize
    window.addEventListener('resize', () => {
        // Пересчитываем позиции всех уведомлений при изменении размера окна
        setTimeout(updateNotificationStack, 100); // Небольшая задержка для стабильности
    });
    
    // Start generating notifications when page loads
    startNotifications();
}); 