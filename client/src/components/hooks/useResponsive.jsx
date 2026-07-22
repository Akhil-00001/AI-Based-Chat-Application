import { useEffect, useState } from "react";

export default function useResponsive() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const resize = () => setWidth(window.innerWidth);

        window.addEventListener("resize", resize);

        return () =>
            window.removeEventListener("resize", resize);
    }, []);

    return {
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
    };
}