import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-500">Tailwind 测试</h1>
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <p className="text-red-500">这是红色文本</p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          测试按钮
        </button>
      </div>
    </div>
  );
};

export default TailwindTest; 