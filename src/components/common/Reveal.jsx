import { useEffect, useRef, useState } from 'react';

const DIRECTIONS = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
};

function Reveal({
    children,
    as: Tag = 'div',
    direction = 'up',
    delay = 0,
    duration = 700,
    className = '',
    once = true,
}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (once) observer.unobserve(node);
                    } else if (!once) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [once]);

    return (
        <Tag
            ref={ref}
            className={`transition-all ease-out ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${DIRECTIONS[direction]}`} ${className}`}
            style={{ transitionDuration: `${duration}ms`, transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
        >
            {children}
        </Tag>
    );
}

export default Reveal;
