/**
 * Shared Theme, Modal & Resources Catalog Logic
 */

(function () {
    // --- 1. Theme Management ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    function initTheme() {
        let theme = 'light';
        try {
            const saved = localStorage.getItem('nmt-theme');
            if (saved) {
                theme = saved;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = 'dark';
            }
        } catch (e) {
            console.warn('Не вдалося завантажити тему:', e);
        }
        applyTheme(theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
            localStorage.setItem('nmt-theme', next);
        } catch (e) {
            console.warn('Не вдалося зберегти тему:', e);
        }
    }

    // Apply theme immediately if possible to prevent flash
    initTheme();

    // --- 2. Resources Catalog Engine (students.html / teachers.html) ---
    window.initResourcesCatalog = function ({ resources, subjects, storageKey }) {
        const sections = [...new Set(resources.map(r => r.section))].sort();
        let filteredResources = [...resources];
        let favorites = [];
        let onlyFavorites = false;

        const searchInput = document.getElementById('searchInput');
        const sectionFilter = document.getElementById('sectionFilter');
        const subjectFilter = document.getElementById('subjectFilter');
        const favoritesBtn = document.getElementById('favoritesFilter');
        const clearBtn = document.getElementById('clearFilters');
        const grid = document.getElementById('resourcesGrid');
        const noResults = document.getElementById('noResults');
        const resultsCount = document.getElementById('resultsCount');

        function loadFavorites() {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) favorites = JSON.parse(saved);
            } catch (e) {
                favorites = [];
            }
        }

        function saveFavorites() {
            try {
                localStorage.setItem(storageKey, JSON.stringify(favorites));
            } catch (e) { }
        }

        function populateFilters() {
            sections.forEach(s => {
                const o = document.createElement('option');
                o.value = s;
                o.textContent = s;
                sectionFilter.appendChild(o);
            });
            subjects.forEach(s => {
                const o = document.createElement('option');
                o.value = s;
                o.textContent = s;
                subjectFilter.appendChild(o);
            });
        }

        function readUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            const sec = params.get('section');
            const subj = params.get('subject');
            const fav = params.get('fav');

            if (q && searchInput) searchInput.value = q;
            if (sec && sectionFilter && sections.includes(sec)) sectionFilter.value = sec;
            if (subj && subjectFilter && subjects.includes(subj)) subjectFilter.value = subj;
            if (fav === '1' && favoritesBtn) {
                onlyFavorites = true;
                favoritesBtn.classList.add('active');
                favoritesBtn.setAttribute('aria-pressed', 'true');
            }
        }

        function syncUrlParams() {
            const params = new URLSearchParams();
            const q = searchInput ? searchInput.value.trim() : '';
            const sec = sectionFilter ? sectionFilter.value : '';
            const subj = subjectFilter ? subjectFilter.value : '';

            if (q) params.set('q', q);
            if (sec) params.set('section', sec);
            if (subj) params.set('subject', subj);
            if (onlyFavorites) params.set('fav', '1');

            const queryString = params.toString();
            const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
            window.history.replaceState(null, '', newUrl);
        }

        function createResourceCard(r) {
            const card = document.createElement('article');
            card.className = 'resource-card';
            const isFav = favorites.includes(r.id);
            const hasLinks = r.additional_links && r.additional_links.length > 0;
            card.innerHTML = `
        <div class="section-badge" style="background-color: ${r.color};">${r.section_short}</div>
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${r.id}" title="${isFav ? 'Видалити з улюблених' : 'Додати до улюблених'}" aria-label="${isFav ? 'Видалити з улюблених' : 'Додати до улюблених'}" aria-pressed="${isFav}"><span aria-hidden="true">${isFav ? '⭐' : '☆'}</span></button>
        <div class="resource-icon" aria-hidden="true">${r.icon}</div>
        <h3 class="resource-title">${r.title}</h3>
        <p class="resource-category">${r.category}</p>
        <p class="resource-description">${r.description}</p>
        <div class="resource-meta">
          <div class="resource-meta-item"><span class="meta-label">📚 Предмети:</span><div class="meta-value subjects-tags">${r.subjects.map(s => `<button type="button" class="subject-tag" data-subject="${s}" title="Фільтрувати за предметом: ${s}">#${s}</button>`).join('')}</div></div>
          <div class="resource-meta-item"><span class="meta-label">📝 Формат:</span><span class="meta-value">${r.format.join(', ')}</span></div>
        </div>
        <div class="resource-actions">
          <a href="${r.primary_link}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Перейти до ресурсу</a>
          ${hasLinks ? `<button type="button" class="btn btn--secondary toggle-links" data-id="${r.id}" aria-expanded="false">Додаткові посилання (${r.additional_links.length})</button><div class="additional-links" id="links-${r.id}">${r.additional_links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="additional-link">→ ${l.title}</a>`).join('')}</div>` : ''}
        </div>`;
            return card;
        }

        function renderResources() {
            const sorted = [...filteredResources].sort((a, b) => a.section.localeCompare(b.section));
            grid.innerHTML = '';
            if (sorted.length === 0) {
                grid.style.display = 'none';
                noResults.style.display = 'block';
            } else {
                grid.style.display = 'grid';
                noResults.style.display = 'none';
                const fragment = document.createDocumentFragment();
                sorted.forEach(r => fragment.appendChild(createResourceCard(r)));
                grid.appendChild(fragment);
                if (window.observeAnimatedElements) window.observeAnimatedElements(grid);
            }
            if (resultsCount) {
                resultsCount.textContent = `Показано ${sorted.length} з ${resources.length} ресурсів`;
            }
        }

        function applyFilters() {
            const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const section = sectionFilter ? sectionFilter.value : '';
            const subject = subjectFilter ? subjectFilter.value : '';

            filteredResources = resources.filter(r => {
                const matchSearch = !search || r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search);
                const matchSection = !section || r.section === section;
                const matchSubject = !subject || r.subjects.includes(subject) || r.subjects.includes('Всі предмети');
                const matchFav = !onlyFavorites || favorites.includes(r.id);
                return matchSearch && matchSection && matchSubject && matchFav;
            });

            syncUrlParams();
            renderResources();
        }

        function toggleFavoritesFilter() {
            onlyFavorites = !onlyFavorites;
            if (favoritesBtn) {
                favoritesBtn.classList.toggle('active', onlyFavorites);
                favoritesBtn.setAttribute('aria-pressed', String(onlyFavorites));
            }
            applyFilters();
        }

        function resetFilters() {
            if (searchInput) searchInput.value = '';
            if (sectionFilter) sectionFilter.value = '';
            if (subjectFilter) subjectFilter.value = '';
            onlyFavorites = false;
            if (favoritesBtn) {
                favoritesBtn.classList.remove('active');
                favoritesBtn.setAttribute('aria-pressed', 'false');
            }
            applyFilters();
        }

        function handleCardActions(e) {
            const toggleBtn = e.target.closest('.toggle-links');
            if (toggleBtn) {
                const id = toggleBtn.getAttribute('data-id');
                const links = document.getElementById(`links-${id}`);
                if (links) {
                    const isActive = links.classList.toggle('active');
                    toggleBtn.setAttribute('aria-expanded', String(isActive));
                    toggleBtn.textContent = isActive ? 'Приховати' : `Додаткові посилання (${links.children.length})`;
                }
                return;
            }

            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                const id = parseInt(favBtn.getAttribute('data-id'), 10);
                const idx = favorites.indexOf(id);
                if (idx === -1) favorites.push(id);
                else favorites.splice(idx, 1);
                const isFav = idx === -1;
                favBtn.classList.toggle('active', isFav);
                favBtn.setAttribute('aria-pressed', String(isFav));
                favBtn.setAttribute('title', isFav ? 'Видалити з улюблених' : 'Додати до улюблених');
                favBtn.setAttribute('aria-label', isFav ? 'Видалити з улюблених' : 'Додати до улюблених');
                const span = favBtn.querySelector('span');
                if (span) span.textContent = isFav ? '⭐' : '☆';
                saveFavorites();
                if (onlyFavorites) applyFilters();
                return;
            }

            const subjectTag = e.target.closest('.subject-tag');
            if (subjectTag && subjectFilter) {
                const subj = subjectTag.getAttribute('data-subject');
                if (subj === 'Всі предмети') {
                    subjectFilter.value = '';
                } else if (subjects.includes(subj)) {
                    subjectFilter.value = subjectFilter.value === subj ? '' : subj;
                }
                applyFilters();
            }
        }

        loadFavorites();
        populateFilters();
        readUrlParams();
        applyFilters();

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (sectionFilter) sectionFilter.addEventListener('change', applyFilters);
        if (subjectFilter) subjectFilter.addEventListener('change', applyFilters);
        if (favoritesBtn) favoritesBtn.addEventListener('click', toggleFavoritesFilter);
        if (clearBtn) clearBtn.addEventListener('click', resetFilters);
        if (grid) grid.addEventListener('click', handleCardActions);
    };

    // --- 3. DOMContentLoaded Initializations ---
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Auto-mark passed events on nmt-lab.html
        const eventRows = document.querySelectorAll('.events-table tbody tr');
        if (eventRows.length > 0) {
            const now = new Date();
            eventRows.forEach(row => {
                const dateCell = row.querySelector('.event-date');
                if (!dateCell) return;
                const match = dateCell.textContent.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (match) {
                    const [, day, month, year] = match;
                    const eventEnd = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
                    if (now > eventEnd) {
                        row.classList.add('event-passed');
                        const btn = row.querySelector('.register-btn');
                        if (btn) {
                            btn.classList.add('disabled');
                            btn.textContent = 'Завершено';
                            btn.removeAttribute('href');
                            btn.setAttribute('aria-disabled', 'true');
                        }
                    }
                }
            });
        }

        // Parent's Guide Modal Logic
        const modal = document.getElementById('parents-modal');
        if (!modal) return;

        const modalImg = document.getElementById('modal-image');
        const modalCounter = document.getElementById('modal-counter');
        const closeBtn = modal.querySelector('.modal-close');
        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        const openBtns = document.querySelectorAll('.open-parents-guide');

        const images = ['Буклет-1.jpg', 'Буклет-2.jpg'];
        let currentIndex = 0;
        let touchStartX = 0;

        function updateImage() {
            if (!modalImg) return;
            modalImg.src = images[currentIndex];
            modalImg.alt = `Путівник для батьків — сторінка ${currentIndex + 1} з ${images.length}`;
            if (modalCounter) {
                modalCounter.textContent = `${currentIndex + 1} / ${images.length}`;
            }
        }

        function openModal() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateImage();
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        }

        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (nextBtn) nextBtn.addEventListener('click', showNext);
        if (prevBtn) prevBtn.addEventListener('click', showPrev);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        modal.addEventListener('touchstart', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const diff = e.changedTouches[0].screenX - touchStartX;
                if (Math.abs(diff) > 50) {
                    if (diff < 0) showNext();
                    else showPrev();
                }
            }
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    });
})();
