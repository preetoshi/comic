$(document).ready(function() {
    // Create an array of image URLs
    var images = [];
    var totalImages = 51; // Update to match your total number of images
    for (var i = 1; i <= totalImages; i++) {
        // Pad single-digit numbers with a leading zero (e.g., "01", "02", etc.)
        var paddedNumber = i < 10 ? "0" + i : i;
        // Update path to use .png extension and correct path for GitHub Pages
        images.push("./images/comicstrip2_" + paddedNumber + ".png");
    }

    var currentIndex = 0;
    var animating = false;

    // Function to update the images and progress bar
    function updateCarousel() {
        // Update left image (if exists)
        if (currentIndex > 0) {
            $(".carousel-item.left img").attr("src", images[currentIndex - 1]);
        } else {
            // If no left image, use a blank white placeholder
            $(".carousel-item.left img").attr("src", "https://via.placeholder.com/600x400/ffffff/ffffff?text=");
        }
        // Update current center image
        $(".carousel-item.center img").attr("src", images[currentIndex]);
        // Update right image (if exists)
        if (currentIndex < totalImages - 1) {
            $(".carousel-item.right img").attr("src", images[currentIndex + 1]);
        } else {
            // If no right image, use a blank white placeholder
            $(".carousel-item.right img").attr("src", "https://via.placeholder.com/600x400/ffffff/ffffff?text=");
        }
        // Update progress bar width (percentage based on current image)
        var progressPercentage = ((currentIndex + 1) / totalImages) * 100;
        $(".progress-fill").css("width", progressPercentage + "%");
    }

    // Initial load
    updateCarousel();

    // Right arrow click event handler
    $(".arrow.right-arrow").click(function() {
        if (animating || currentIndex >= totalImages - 1) return;
        animating = true;
        currentIndex++;
        // Slide to the next image (move from -100% to -200%)
        $(".carousel-inner").css("transform", "translateX(-200%)");

        setTimeout(function() {
            // After transition, update contents and reset the inner container to show the center slide
            updateCarousel();
            $(".carousel-inner").css({
                "transition": "none",
                "transform": "translateX(-100%)"
            });
            // Force reflow to restart CSS transition
            $(".carousel-inner")[0].offsetHeight;
            $(".carousel-inner").css("transition", "transform 0.5s ease");
            animating = false;
        }, 500);
    });

    // Left arrow click event handler
    $(".arrow.left-arrow").click(function() {
        if (animating || currentIndex <= 0) return;
        animating = true;
        currentIndex--;
        // Slide to the previous image (move from -100% to 0%)
        $(".carousel-inner").css("transform", "translateX(0%)");

        setTimeout(function() {
            updateCarousel();
            $(".carousel-inner").css({
                "transition": "none",
                "transform": "translateX(-100%)"
            });
            $(".carousel-inner")[0].offsetHeight;
            $(".carousel-inner").css("transition", "transform 0.5s ease");
            animating = false;
        }, 500);
    });
}); 