
import React, { useState } from 'react';
import { UserRole } from '../types';
import BotIcon from './icons/BotIcon';
import { EMPLOYEE_PASSWORD, BOT_NAME } from '../constants'; 

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  apiKeyMissing: boolean;
}

type View = 'roleSelection' | 'passwordInput';

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, apiKeyMissing }) => {
  const [currentView, setCurrentView] = useState<View>('roleSelection');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleEmployeeRoleClick = () => {
    setCurrentView('passwordInput');
    setPassword('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === EMPLOYEE_PASSWORD) {
      onSelectRole('employee');
    } else {
      setPasswordError('Mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  const handleBackToRoleSelection = () => {
    setCurrentView('roleSelection');
    setPasswordError(null);
  }

  if (apiKeyMissing) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-auto">
        <BotIcon className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Chào mừng đến với {BOT_NAME}!</h1>
        <div className="my-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <h2 className="font-semibold text-lg">Lỗi Cấu Hình Quan Trọng!</h2>
          <p className="mt-1">
            Không tìm thấy API Key. Chức năng chatbot sẽ không thể hoạt động.
            Vui lòng liên hệ quản trị viên để cấu hình API Key.
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'passwordInput') {
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-auto">
        <BotIcon className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Xác thực vai trò Nhân viên Mizuchan</h2>
        <p className="text-gray-600 mb-6">Vui lòng nhập mật khẩu để tiếp tục.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null); // Clear error on typing
              }}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              aria-label="Mật khẩu nhân viên"
              autoFocus
            />
          </div>
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
             <button
              type="button"
              onClick={handleBackToRoleSelection}
              className="w-full sm:w-auto flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default view: roleSelection
  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-auto">
      <BotIcon className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Chào mừng đến với {BOT_NAME}!</h1>
      <p className="text-gray-600 mb-8">Vui lòng chọn vai trò của bạn để {BOT_NAME} có thể hỗ trợ tốt nhất:</p>
      <div className="space-y-4">
        <button
          onClick={() => onSelectRole('customer')}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          aria-label="Tôi là Khách hàng"
        >
          <span role="img" aria-label="Biểu tượng khách hàng" className="mr-2">🛍️</span>
          Tôi là Khách hàng
        </button>
        <button
          onClick={handleEmployeeRoleClick}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          aria-label="Tôi là Nhân viên Mizuchan"
        >
          <span role="img" aria-label="Biểu tượng nhân viên" className="mr-2">🧑‍💼</span>
          Tôi là Nhân viên Mizuchan
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-8">
        Lựa chọn của bạn sẽ giúp {BOT_NAME} cung cấp thông tin phù hợp nhất.
      </p>
    </div>
  );
};

export default RoleSelectionScreen;