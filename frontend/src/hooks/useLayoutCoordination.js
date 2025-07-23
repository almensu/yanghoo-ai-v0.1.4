import { useState, useEffect, useCallback } from 'react';

// 布局协调hook，用于管理多个面板的展开状态和冲突解决
export const useLayoutCoordination = () => {
  const [panels, setPanels] = useState({
    studioWorkSpace: { expanded: false, priority: 1 },
    projectBasket: { expanded: false, priority: 2 },
    sidebar: { expanded: true, priority: 0 }
  });

  // 切换面板状态
  const togglePanel = useCallback((panelName) => {
    setPanels(prev => {
      const newPanels = { ...prev };
      const targetPanel = newPanels[panelName];
      
      if (!targetPanel) return prev;

      // 如果要展开面板
      if (!targetPanel.expanded) {
        // 检查是否有冲突
        const conflicts = checkConflicts(panelName, newPanels);
        
        // 解决冲突：收起优先级较低的面板
        conflicts.forEach(conflictPanel => {
          if (newPanels[conflictPanel].priority > targetPanel.priority) {
            newPanels[conflictPanel].expanded = false;
          }
        });
      }

      // 切换目标面板状态
      newPanels[panelName].expanded = !targetPanel.expanded;
      
      return newPanels;
    });
  }, []);

  // 检查面板冲突
  const checkConflicts = (panelName, currentPanels) => {
    const conflicts = [];
    
    // StudioWorkSpace与ProjectBasket的冲突检查
    if (panelName === 'studioWorkSpace' && currentPanels.projectBasket.expanded) {
      conflicts.push('projectBasket');
    } else if (panelName === 'projectBasket' && currentPanels.studioWorkSpace.expanded) {
      conflicts.push('studioWorkSpace');
    }
    
    return conflicts;
  };

  // 获取面板状态
  const getPanelState = useCallback((panelName) => {
    return panels[panelName] || { expanded: false, priority: 999 };
  }, [panels]);

  // 获取布局样式
  const getLayoutStyles = useCallback(() => {
    const { studioWorkSpace, projectBasket } = panels;
    
    return {
      // 主内容区域的右边距
      mainContentMargin: projectBasket.expanded ? 'mr-96' : 'mr-16',
      
      // StudioWorkSpace的z-index和位置
      studioWorkSpaceClass: studioWorkSpace.expanded 
        ? 'absolute left-0 z-30 w-[50%] h-full top-0' 
        : 'flex-1 min-w-0',
      
      // ProjectBasket的z-index
      projectBasketZIndex: 'z-50',
      
      // 是否显示冲突警告
      showConflictWarning: studioWorkSpace.expanded && projectBasket.expanded
    };
  }, [panels]);

  // 强制收起所有面板
  const collapseAll = useCallback(() => {
    setPanels(prev => {
      const newPanels = { ...prev };
      Object.keys(newPanels).forEach(key => {
        if (key !== 'sidebar') { // 保持侧边栏状态
          newPanels[key].expanded = false;
        }
      });
      return newPanels;
    });
  }, []);

  // 智能布局调整
  const smartLayout = useCallback((screenWidth) => {
    if (screenWidth < 1024) { // 小屏幕
      collapseAll();
    } else if (screenWidth < 1440) { // 中等屏幕
      setPanels(prev => ({
        ...prev,
        studioWorkSpace: { ...prev.studioWorkSpace, expanded: false },
        projectBasket: { ...prev.projectBasket, expanded: false }
      }));
    }
    // 大屏幕保持当前状态
  }, [collapseAll]);

  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      smartLayout(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [smartLayout]);

  return {
    panels,
    togglePanel,
    getPanelState,
    getLayoutStyles,
    collapseAll,
    smartLayout
  };
}; 