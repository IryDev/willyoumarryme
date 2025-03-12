document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const header = document.querySelector("header");
    const model = document.querySelector(".model");

    let currentSection = 0;

    // Update the background and model position when scrolling
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollY >= sectionTop - window.innerHeight * 0.5 && scrollY < sectionBottom - window.innerHeight * 0.5) {
                section.classList.add("active-section");
                section.classList.remove("inactive-section");
            } else {
                section.classList.remove("active-section");
                section.classList.add("inactive-section");
            }
        });

        // Rotate the 3D model based on scroll
        model.style.transform = `translate(-50%, -50%) rotateY(${scrollY / 5}deg)`;
    });

    // Center the text in each section with a nice fade-in effect
    sections.forEach((section, index) => {
        section.addEventListener("scroll", () => {
            if (section.classList.contains("active-section")) {
                section.style.opacity = 1;
            }
        });
    });
});
