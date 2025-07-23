import { useState, useEffect } from 'react';

// 断点定义
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// 响应式hook
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  const isSmallScreen = windowSize.width < breakpoints.sm;
  const isMediumScreen = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
  const isLargeScreen = windowSize.width >= breakpoints.lg;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    breakpoints
  };
};

// 屏幕尺寸检测hook
export const useScreenSize = () => {
  const { windowSize, isMobile, isTablet, isDesktop } = useResponsive();
  
  // 根据屏幕尺寸返回不同的布局配置
  const getLayoutConfig = () => {
    if (isMobile) {
      return {
        projectBasketWidth: 'w-full',
        chatMargin: 'mr-0',
        showSidebar: false,
        itemsPerRow: 1,
        maxWidth: 'max-w-full'
      };
    } else if (isTablet) {
      return {
        projectBasketWidth: 'w-80',
        chatMargin: 'mr-80',
        showSidebar: true,
        itemsPerRow: 2,
        maxWidth: 'max-w-4xl'
      };
    } else {
      return {
        projectBasketWidth: 'w-96',
        chatMargin: 'mr-96',
        showSidebar: true,
        itemsPerRow: 3,
        maxWidth: 'max-w-7xl'
      };
    }
  };

  return {
    ...useResponsive(),
    layoutConfig: getLayoutConfig()
  };
}; 