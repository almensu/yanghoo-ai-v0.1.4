import { useState, useEffect, useMemo, useCallback } from 'react';

// 虚拟化hook，用于优化大量数据的渲染
export const useVirtualization = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerElement, setContainerElement] = useState(null);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!items.length) return { start: 0, end: 0 };

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // 总高度
  const totalHeight = items.length * itemHeight;

  // 滚动处理
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // 容器ref回调
  const containerRef = useCallback((element) => {
    setContainerElement(element);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerRef,
    visibleRange
  };
};

// 虚拟化列表组件
export const VirtualizedList = ({
  items,
  itemHeight = 80,
  height = 400,
  renderItem,
  className = '',
  overscan = 5
}) => {
  const {
    visibleItems,
    totalHeight,
    handleScroll,
    containerRef
  } = useVirtualization({
    items,
    itemHeight,
    containerHeight: height,
    overscan
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={item.id || item.index}
            style={{
              position: 'absolute',
              top: item.top,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, item.index)}
          </div>
        ))}
      </div>
    </div>
  );
}; 