// Get the audio element
const notificationSound = document.getElementById('notificationSound');

// Function to play the notification sound
function playNotificationSound() {
    if (notificationSound) {
        notificationSound.play().catch(error => {
            // Auto-play might be prevented by the browser
            console.error('Notification sound play prevented:', error);
        });
    }
}

// Make the function accessible globally
window.playNotificationSound = playNotificationSound;
