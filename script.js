$(document).ready(function() {
    // Create an array of image URLs
    var images = [];
    var totalImages = 51; // Total number of images
    for (var i = 1; i <= totalImages; i++) {
        images.push("./images/Artboard-" + i + ".png");
    }

    // Create audio element for page change sound
    var pageChangeSound = new Audio('./sounds/page_change.wav');
    pageChangeSound.volume = 0.5; // Set volume to 50%

    // Add error handling for sound
    pageChangeSound.addEventListener('error', function(e) {
        console.error('Error loading sound:', e);
    });

    // Ambience configuration
    var ambiences = {
        inside: {
            sound: new Audio('./sounds/inside.mp3'),
            ranges: [[1, 12]], // Inside house ambience plays for images 1-12
            volume: 0.3
        },
        city: {
            sound: new Audio('./sounds/city.mp3'),
            ranges: [[13, 31], [49, 51]], // City ambience plays for images 13-31 and 49-51
            volume: 0.2
        },
        park: {
            sound: new Audio('./sounds/park.wav'),
            ranges: [[15, 23]], // Park ambience plays for images 15-23
            volume: 0.3
        },
        bus: {
            sound: new Audio('./sounds/bus.mp3'),
            ranges: [[32, 48]], // Bus ambience plays for images 32-48
            volume: 0.3
        }
    };

    // Initialize ambience sounds
    Object.values(ambiences).forEach(ambience => {
        ambience.sound.loop = true;
        ambience.sound.volume = ambience.volume;
        ambience.sound.addEventListener('error', function(e) {
            console.error('Error loading ambience sound:', e);
        });
    });

    // SFX handling
    var currentSFX = null;
    
    function playSFX(index) {
        // Stop any currently playing SFX
        if (currentSFX) {
            currentSFX.pause();
            currentSFX.currentTime = 0;
        }
        
        // Create and play new SFX
        const sfxPath = `./sounds/SFX/sfx${index + 1}.mp3`;
        currentSFX = new Audio(sfxPath);
        currentSFX.volume = 0.5; // Set SFX volume to 50%
        
        currentSFX.addEventListener('error', function(e) {
            console.error(`Error loading SFX for image ${index + 1}:`, e);
        });
        
        currentSFX.play().catch(error => {
            console.error('Error playing SFX:', error);
        });
    }

    var currentIndex = 0;
    var animating = false;
    var $image = $('.comic-image');
    var currentAmbience = null;

    // Function to check if a number is within any of the given ranges
    function isInRanges(number, ranges) {
        return ranges.some(range => number >= range[0] && number <= range[1]);
    }

    // Function to update the current ambience based on image index
    function updateAmbience(index) {
        // Find the appropriate ambience for the current image
        let newAmbience = null;
        for (const [name, ambience] of Object.entries(ambiences)) {
            if (isInRanges(index + 1, ambience.ranges)) {
                newAmbience = name;
                break;
            }
        }

        // Only change ambience if we're moving to a different one
        if (newAmbience !== currentAmbience) {
            // Stop all ambiences first
            Object.values(ambiences).forEach(ambience => {
                ambience.sound.pause();
                ambience.sound.currentTime = 0;
            });

            // Play the new ambience if one exists for this range
            if (newAmbience) {
                currentAmbience = newAmbience;
                const sound = ambiences[newAmbience].sound;
                sound.currentTime = 0; // Only reset when changing ambiences
                sound.play().catch(error => {
                    console.error('Error playing ambience:', error);
                });
            } else {
                currentAmbience = null;
            }
        } else if (newAmbience && ambiences[newAmbience].sound.paused) {
            // If we're in the same ambience but it's paused, resume it
            const sound = ambiences[newAmbience].sound;
            sound.play().catch(error => {
                console.error('Error playing ambience:', error);
            });
        }
    }

    // Function to play haptic feedback (if supported)
    function playHapticFeedback() {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50); // Vibrate for 50ms
        }
    }

    // Function to play sound and haptic feedback
    function playFeedback() {
        try {
            pageChangeSound.currentTime = 0; // Reset sound to start
            pageChangeSound.play().catch(function(error) {
                console.error('Error playing sound:', error);
            });
        } catch (error) {
            console.error('Error with sound:', error);
        }
        playHapticFeedback();
    }

    // Function to update the image and progress bar
    function updateImage() {
        // Update progress bar width (percentage based on current image)
        var progressPercentage = ((currentIndex + 1) / totalImages) * 100;
        $(".progress-fill").css("width", progressPercentage + "%");
        
        // Update ambience
        updateAmbience(currentIndex);
        
        // Play SFX for current image
        playSFX(currentIndex);
    }

    // Function to change image with scale effect
    function changeImage(newIndex) {
        if (animating || newIndex < 0 || newIndex >= totalImages) return;
        
        animating = true;
        const oldIndex = currentIndex;
        currentIndex = newIndex;
        
        // Play feedback
        playFeedback();
        
        // Check if we're crossing between different ambience ranges
        const oldAmbience = getAmbienceForIndex(oldIndex);
        const newAmbience = getAmbienceForIndex(newIndex);
        const isRangeTransition = oldAmbience !== newAmbience;
        
        if (isRangeTransition) {
            // Special transition between ranges
            const $container = $('.comic-image-container');
            const $oldImage = $image.clone();
            $oldImage.insertAfter($image);
            
            // Add transition classes
            $container.addClass('transitioning');
            $oldImage.addClass('fade-out');
            $image.addClass('fade-in');
            
            // Update the new image source
            $image.attr('src', images[currentIndex]);
            
            // Remove old image after fade out
            setTimeout(() => {
                $oldImage.remove();
                $container.removeClass('transitioning');
                $image.removeClass('fade-in');
                animating = false;
            }, 1000); // Match fadeOut duration
        } else {
            // Normal transition within same range
            $image.attr('src', images[currentIndex]);
            $image.addClass('scale-up');
            
            setTimeout(() => {
                $image.removeClass('scale-up');
                animating = false;
            }, 200);
        }
        
        // Update progress bar and ambience
        updateImage();
    }

    // Helper function to get ambience for an index
    function getAmbienceForIndex(index) {
        for (const [name, ambience] of Object.entries(ambiences)) {
            if (isInRanges(index + 1, ambience.ranges)) {
                return name;
            }
        }
        return null;
    }

    // Initial load
    $image.attr('src', images[0]);
    updateImage();
    
    // Start initial ambience only after user interaction
    $(document).one('click keydown', function() {
        updateAmbience(0);
    });

    // Right arrow click event handler
    $(".arrow.right-arrow").click(function() {
        changeImage(currentIndex + 1);
    });

    // Left arrow click event handler
    $(".arrow.left-arrow").click(function() {
        changeImage(currentIndex - 1);
    });

    // Keyboard navigation
    $(document).keydown(function(e) {
        if (e.keyCode === 37) { // Left arrow key
            changeImage(currentIndex - 1);
        } else if (e.keyCode === 39) { // Right arrow key
            changeImage(currentIndex + 1);
        }
    });
}); 