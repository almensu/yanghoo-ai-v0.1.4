import React from 'react';
import AssSubtitleTest from '../components/AssSubtitleTest';

const TestPage_AssSubtitle = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">ASS字幕渲染测试</h1>
        <AssSubtitleTest />
      </div>
    </div>
  );
};

export default TestPage_AssSubtitle; 