
document.addEventListener('DOMContentLoaded', () => {
    // --- Parent's Guide Modal Logic ---
    const modal = document.getElementById('parents-modal');
    // If modal doesn't exist on this page, do nothing
    if (!modal) return;

    const modalImg = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');
    const openBtns = document.querySelectorAll('.open-parents-guide');

    // Images for the booklet
    const images = ['Буклет-1.jpg', 'Буклет-2.jpg'];
    let currentIndex = 0;

    function openModal() {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        updateImage();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateImage() {
        if (!modalImg) return;
        modalImg.src = images[currentIndex];
        modalImg.alt = `Сторінка ${currentIndex + 1}`;
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    }

    // Event Listeners
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
});
