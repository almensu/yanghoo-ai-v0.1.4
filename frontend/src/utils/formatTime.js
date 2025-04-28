// 辅助函数：将秒数格式化为 HH:MM:SS.mmm
export const formatTime = (timeInSeconds) => {
  // 处理无效输入
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00:00.000';
  }
  // 计算时、分、秒、毫秒
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

  // 格式化并补零
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}; 