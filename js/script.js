document.addEventListener('DOMContentLoaded', () => {
    const anchors = document.querySelectorAll('[data-anchor]');
	if (anchors.length > 0) {
		anchors.forEach(anchor => anchor.addEventListener('click', e => {
			e.preventDefault();
			window.scrollTo({
				left: 0,
				top: document.querySelector('#' + anchor.dataset.anchor).offsetTop - 80,
				behavior: 'smooth'
			});
		}));
	}
    
    const faqItems = Array.from(document.querySelectorAll('.faq__item'));

    const closeFaq = (item) => {
        const body = item.querySelector('.faq__item_body');
        item.classList.remove('is-open');
        if (body) body.style.maxHeight = '';
    };

    const openFaq = (item) => {
        const body = item.querySelector('.faq__item_body');
        item.classList.add('is-open');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
    };

    faqItems.forEach(item => {
        const head = item.querySelector('.faq__item_head');
        if (!head) return;
        head.addEventListener('click', () => {
            const willOpen = !item.classList.contains('is-open');
            faqItems.forEach(closeFaq);
            if (willOpen) openFaq(item);
        });
    });

    window.addEventListener('resize', () => {
        const open = document.querySelector('.faq__item.is-open .faq__item_body');
        if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });

    const burger = document.querySelector('.header__burger');
    const header = document.querySelector('.header');
    if (burger && header) {
        burger.addEventListener('click', () => {
            header.classList.toggle('is-menu-open');
            document.body.classList.toggle('is-locked', header.classList.contains('is-menu-open'));
        });
        header.querySelectorAll('.header__nav a').forEach(a => {
            a.addEventListener('click', () => {
                header.classList.remove('is-menu-open');
                document.body.classList.remove('is-locked');
            });
        });
    }

    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.demo-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('.demo-form__btn');
            if (btn) {
                const original = btn.textContent;
                btn.textContent = form.dataset.success || 'Заявка отправлена!';
                btn.disabled = true;
                setTimeout(() => { btn.textContent = original; btn.disabled = false; form.reset(); }, 2500);
            }
        });
    });

    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        const heads    = tab.querySelectorAll('[data-tab-head]');
        const contents = tab.querySelectorAll('[data-tab-content]');

        heads.forEach((head, idx) => {
            head.addEventListener('click', () => {
                heads   .forEach(h=>h.setAttribute('data-tab-head',    ''));
                contents.forEach(c=>c.setAttribute('data-tab-content', ''));

                head         .setAttribute('data-tab-head',    'active');
                contents[idx].setAttribute('data-tab-content', 'active');

                requestAnimationFrame(updateOsFades);
            });
        });
    });

    const osRows = Array.from(document.querySelectorAll('.protect__os'));

    const updateOsFade = (row) => {
        const scrollable = row.scrollWidth - row.clientWidth;
        const atEnd = scrollable <= 1 || row.scrollLeft >= scrollable - 1;
        row.classList.toggle('is-end', atEnd);
    };

    function updateOsFades() {
        osRows.forEach(updateOsFade);
    }

    osRows.forEach(row => {
        row.addEventListener('scroll', () => updateOsFade(row), { passive: true });
    });
    window.addEventListener('resize', updateOsFades);
    updateOsFades();

    const trustMore = document.querySelector('.trust__more');
    if (trustMore) {
        trustMore.addEventListener('click', () => {
            document.querySelector('.trust__track').classList.add('is-expanded');
            trustMore.hidden = true;
        });
    }

    if (window.Swiper) {
        const mobileSlider = (containerSel, paginationSel, options) => {
            const el = document.querySelector(containerSel);
            if (!el) return;
            const mq = window.matchMedia('(max-width: 1100px)');
            let sw = null;

            const sync = () => {
                if (mq.matches && !sw) {
                    sw = new Swiper(el, Object.assign({
                        pagination: { el: paginationSel, clickable: true },
                    }, options));
                } else if (!mq.matches && sw) {
                    sw.destroy(true, true);
                    sw = null;
                }
            };

            sync();
            mq.addEventListener('change', sync);
        };

        mobileSlider('.architecture__cards', '.architecture__pagination', { slidesPerView: 1.15, spaceBetween: 17 });
        mobileSlider('.capabilities__grid', '.capabilities__pagination', { slidesPerView: 1.15, spaceBetween: 17 });
        mobileSlider('.press__grid', '.press__pagination', { slidesPerView: 1.1, spaceBetween: 17 });

        const trustEl = document.querySelector('.trust__slider');
        if (trustEl) {
            const mq = window.matchMedia('(max-width: 1100px)');
            let sw = null;

            // на десктопе слайдер 4×2, на мобилке — обычная сетка с «Показать еще»
            const sync = () => {
                if (!mq.matches && !sw) {
                    sw = new Swiper(trustEl, {
                        slidesPerView: 4,
                        grid: { rows: 2, fill: 'row' },
                        spaceBetween: 30,
                        watchOverflow: false,
                        navigation: {
                            prevEl: '.trust__nav-btn--prev',
                            nextEl: '.trust__nav-btn--next',
                        },
                    });
                } else if (mq.matches && sw) {
                    sw.destroy(true, true);
                    sw = null;
                }
            };

            sync();
            mq.addEventListener('change', sync);
        }

        const protectEls = Array.from(document.querySelectorAll('.protect__os'));
        const protectHeads = Array.from(document.querySelectorAll('.protect__head'));
        if (protectEls.length) {
            const mq = window.matchMedia('(max-width: 1100px)');
            let protectSliders = [];

            // ленивая инициализация: слайдер вкладки создаётся только когда она видима
            // (у скрытых вкладок ширина 0, и swiper посчитал бы слайды неверно)
            const initOne = (idx) => {
                const el = protectEls[idx];
                if (!el) return;
                if (protectSliders[idx]) { protectSliders[idx].update(); return; }
                const content = el.closest('.protect__content');
                protectSliders[idx] = new Swiper(el, {
                    slidesPerView: 1.1,
                    spaceBetween: 15,
                    navigation: {
                        prevEl: content.querySelector('.protect__nav-btn--prev'),
                        nextEl: content.querySelector('.protect__nav-btn--next'),
                    },
                });
            };

            const enableProtect = () => {
                const active = protectHeads.findIndex(h => h.getAttribute('data-tab-head') === 'active');
                initOne(active < 0 ? 0 : active);
            };

            const disableProtect = () => {
                protectSliders.forEach(s => s && s.destroy(true, true));
                protectSliders = [];
            };

            const syncProtect = () => {
                const anyActive = protectSliders.some(Boolean);
                if (mq.matches && !anyActive) enableProtect();
                else if (!mq.matches && anyActive) disableProtect();
            };

            syncProtect();
            mq.addEventListener('change', syncProtect);

            protectHeads.forEach((head, idx) => {
                head.addEventListener('click', () => {
                    if (mq.matches) initOne(idx);
                });
            });
        }
    }
});
